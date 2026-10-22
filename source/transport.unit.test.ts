import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fail, fakeFetch, ok, TIME } from './__fixtures__/bitrix.js'
import { BitrixError } from './errors.js'
import { createLimiter, type Limiter } from './limiter.js'
import { createTransport, type TransportOptions } from './transport.js'

const URL_BASE = 'https://portal.bitrix24.com/rest/1/token'

const unlimited: Limiter = { acquire: () => Promise.resolve(), exhaust: vi.fn<() => void>() }

const setup = (
  handler: Parameters<typeof fakeFetch>[0],
  options: Partial<TransportOptions> = {},
  limiter: Limiter = unlimited
) => {
  const fake = fakeFetch(handler)
  const transport = createTransport({ url: URL_BASE, fetch: fake.fetch, retry: { delay: 10 }, ...options }, limiter)
  return { ...fake, transport }
}

describe('createTransport', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('posts params as JSON to the method URL and returns the envelope', async () => {
    const { transport, fetch, requests } = setup(() => ok({ ID: '1' }, { total: 1 }))

    await expect(transport('crm.deal.get', { id: 1 })).resolves.toEqual({ result: { ID: '1' }, time: TIME, total: 1 })
    expect(vi.mocked(fetch).mock.calls[0]?.[0]).toEqual(new URL(`${URL_BASE}/crm.deal.get`))
    expect(requests[0]?.init).toMatchObject({
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' }
    })
    expect(requests[0]?.body).toEqual({ id: 1 })
  })

  it('accepts a base URL with a trailing slash and no params', async () => {
    const { transport, fetch, requests } = setup(() => ok(true), { url: `${URL_BASE}/` })
    await transport('user.current')
    expect(vi.mocked(fetch).mock.calls[0]?.[0]).toEqual(new URL(`${URL_BASE}/user.current`))
    expect(requests[0]?.body).toEqual({})
  })

  it('uses the global fetch by default', async () => {
    const fake = fakeFetch(() => ok(1))
    vi.stubGlobal('fetch', fake.fetch)
    try {
      await expect(createTransport({ url: URL_BASE }, unlimited)('a.b')).resolves.toMatchObject({ result: 1 })
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('accepts a response without timing info', async () => {
    const { transport } = setup(() => ({ body: { result: 1 } }))
    await expect(transport('a.b')).resolves.toEqual({ result: 1 })
  })

  it('waits for the limiter before every request', async () => {
    const limiter = createLimiter({ burst: 1, refillPerSecond: 1 })
    const { transport, requests } = setup(() => ok(1), {}, limiter)

    const first = transport('a.b')
    const second = transport('a.b')
    await vi.advanceTimersByTimeAsync(0)
    expect(requests).toHaveLength(1)
    await vi.advanceTimersByTimeAsync(1000)
    await Promise.all([first, second])
    expect(requests).toHaveLength(2)
  })

  it('adds a static auth token to the body', async () => {
    const { transport, requests } = setup(() => ok(1), { auth: 'secret' })
    await transport('a.b', { x: 1 })
    expect(requests[0]?.body).toEqual({ x: 1, auth: 'secret' })
  })

  it('asks an auth provider for the token on every request', async () => {
    const auth = vi.fn<() => Promise<string>>().mockResolvedValueOnce('one').mockResolvedValueOnce('two')
    const { transport, requests } = setup(() => ok(1), { auth })
    await transport('a.b')
    await transport('a.b')
    expect(requests.map((request) => request.body.auth)).toEqual(['one', 'two'])
  })

  describe('errors', () => {
    it('throws BitrixError with code, description and status', async () => {
      const { transport } = setup(() => fail(404, 'ERROR_METHOD_NOT_FOUND', 'Method not found!'))
      const error = await transport('no.such.method').catch((caught: unknown) => caught)
      expect(error).toBeInstanceOf(BitrixError)
      expect(error).toMatchObject({
        code: 'ERROR_METHOD_NOT_FOUND',
        description: 'Method not found!',
        method: 'no.such.method',
        status: 404,
        message: 'no.such.method: ERROR_METHOD_NOT_FOUND Method not found!'
      })
    })

    it('falls back to the HTTP status when Bitrix sends an empty code', async () => {
      const { transport } = setup(() => fail(400, '', 'Not found'))
      await expect(transport('crm.deal.get', { id: 0 })).rejects.toMatchObject({
        code: 'HTTP_400',
        description: 'Not found'
      })
    })

    it('throws on an error body even with a 200 status', async () => {
      const { transport } = setup(() => fail(200, 'SOME_ERROR'))
      await expect(transport('a.b')).rejects.toMatchObject({ code: 'SOME_ERROR', status: 200 })
    })

    it('uses the status text when an error body has no description', async () => {
      const { transport } = setup(() => ({ status: 403, body: {} }))
      await expect(transport('a.b')).rejects.toMatchObject({ code: 'HTTP_403' })
    })

    it('throws INVALID_RESPONSE on a non JSON body', async () => {
      const { transport } = setup(() => ({ status: 502, body: '<html>Bad gateway</html>' }), { retry: { retries: 0 } })
      await expect(transport('a.b')).rejects.toMatchObject({
        code: 'INVALID_RESPONSE',
        status: 502,
        description: 'expected JSON, received <html>Bad gateway</html>'
      })
    })

    it('does not retry client errors', async () => {
      const { transport, requests } = setup(() => fail(400, 'ERROR_CORE', 'bad'))
      await expect(transport('a.b')).rejects.toMatchObject({ code: 'ERROR_CORE' })
      expect(requests).toHaveLength(1)
    })

    it('does not retry programming errors', async () => {
      const transport = createTransport(
        {
          url: URL_BASE,
          fetch: () => {
            throw new RangeError('boom')
          }
        },
        unlimited
      )
      await expect(transport('a.b')).rejects.toThrow(RangeError)
    })
  })

  describe('retries', () => {
    it('retries server errors with exponential backoff', async () => {
      const replies = [fail(500, 'INTERNAL_SERVER_ERROR'), fail(502, 'BAD_GATEWAY'), ok('done')]
      const { transport, requests } = setup(() => replies.shift() as never)

      const result = transport('a.b')
      await vi.advanceTimersByTimeAsync(0)
      expect(requests).toHaveLength(1)
      await vi.advanceTimersByTimeAsync(10)
      expect(requests).toHaveLength(2)
      await vi.advanceTimersByTimeAsync(19)
      expect(requests).toHaveLength(2)
      await vi.advanceTimersByTimeAsync(1)
      await expect(result).resolves.toMatchObject({ result: 'done' })
      expect(requests).toHaveLength(3)
    })

    it('retries network errors', async () => {
      let attempts = 0
      const fetch = vi.fn<typeof globalThis.fetch>(async () => {
        attempts += 1
        if (attempts === 1) throw new TypeError('fetch failed')
        return Response.json({ result: 1, time: TIME })
      })
      const transport = createTransport({ url: URL_BASE, fetch, retry: { delay: 0 } }, unlimited)
      const result = transport('a.b')
      await vi.runAllTimersAsync()
      await expect(result).resolves.toMatchObject({ result: 1 })
      expect(fetch).toHaveBeenCalledTimes(2)
    })

    it('gives up after the configured number of retries', async () => {
      const { transport, requests } = setup(() => fail(503, 'SERVICE_UNAVAILABLE'), { retry: { retries: 2, delay: 0 } })
      const result = transport('a.b').catch((error: unknown) => error)
      await vi.runAllTimersAsync()
      expect(await result).toMatchObject({ code: 'SERVICE_UNAVAILABLE' })
      expect(requests).toHaveLength(3)
    })

    it('empties the limiter and retries right away on QUERY_LIMIT_EXCEEDED', async () => {
      const replies = [fail(503, 'QUERY_LIMIT_EXCEEDED', 'Too many requests'), ok(1)]
      const limiter: Limiter = {
        acquire: vi.fn<() => Promise<void>>(() => Promise.resolve()),
        exhaust: vi.fn<() => void>()
      }
      const { transport } = setup(() => replies.shift() as never, {}, limiter)

      const result = transport('a.b')
      await vi.advanceTimersByTimeAsync(0)
      await expect(result).resolves.toMatchObject({ result: 1 })
      expect(limiter.exhaust).toHaveBeenCalledOnce()
      expect(limiter.acquire).toHaveBeenCalledTimes(2)
    })

    it('waits for operating_reset_at on OPERATION_TIME_LIMIT', async () => {
      vi.setSystemTime(1_000_000_000)
      const replies = [
        { body: { result: 1, time: { ...TIME, operating_reset_at: 1_000_005 } } },
        fail(503, 'OPERATION_TIME_LIMIT'),
        ok(2)
      ]
      const { transport, requests } = setup(() => replies.shift() as never)
      await transport('crm.activity.list')

      const result = transport('crm.activity.list')
      await vi.advanceTimersByTimeAsync(4999)
      expect(requests).toHaveLength(2)
      await vi.advanceTimersByTimeAsync(1)
      await expect(result).resolves.toMatchObject({ result: 2 })
    })

    it('falls back to backoff when operating_reset_at already passed', async () => {
      vi.setSystemTime(2_000_000_000)
      const replies = [ok(1), fail(503, 'OPERATION_TIME_LIMIT'), ok(2)]
      const { transport, requests } = setup(() => replies.shift() as never)
      await transport('a.b')
      const result = transport('a.b')
      await vi.advanceTimersByTimeAsync(9)
      expect(requests).toHaveLength(2)
      await vi.advanceTimersByTimeAsync(1)
      await expect(result).resolves.toMatchObject({ result: 2 })
    })

    it('falls back to backoff on OPERATION_TIME_LIMIT without a known reset time', async () => {
      const replies = [fail(503, 'OPERATION_TIME_LIMIT'), ok(1)]
      const { transport, requests } = setup(() => replies.shift() as never)
      const result = transport('a.b')
      await vi.advanceTimersByTimeAsync(9)
      expect(requests).toHaveLength(1)
      await vi.advanceTimersByTimeAsync(1)
      await expect(result).resolves.toMatchObject({ result: 1 })
    })
  })

  describe('expired tokens', () => {
    it('calls onAuthExpired once and retries with a fresh token', async () => {
      let token = 'old'
      const onAuthExpired = vi.fn<() => void>(() => {
        token = 'new'
      })
      const { transport, requests } = setup(
        (_method, body) => (body.auth === 'old' ? fail(401, 'expired_token') : ok(1)),
        {
          auth: () => token,
          onAuthExpired
        }
      )

      await expect(transport('a.b')).resolves.toMatchObject({ result: 1 })
      expect(onAuthExpired).toHaveBeenCalledOnce()
      expect(requests.map((request) => request.body.auth)).toEqual(['old', 'new'])
    })

    it('throws when the token is still expired after a refresh', async () => {
      const onAuthExpired = vi.fn<() => void>()
      const { transport, requests } = setup(() => fail(401, 'expired_token'), { auth: 'old', onAuthExpired })
      await expect(transport('a.b')).rejects.toMatchObject({ code: 'expired_token' })
      expect(onAuthExpired).toHaveBeenCalledOnce()
      expect(requests).toHaveLength(2)
    })

    it('throws without onAuthExpired', async () => {
      const { transport } = setup(() => fail(401, 'expired_token'), { auth: 'old' })
      await expect(transport('a.b')).rejects.toMatchObject({ code: 'expired_token' })
    })

    it('shares one refresh between concurrent requests', async () => {
      let token = 'old'
      const onAuthExpired = vi.fn<() => Promise<void>>(async () => {
        await Promise.resolve()
        token = 'new'
      })
      const { transport } = setup((_method, body) => (body.auth === 'old' ? fail(401, 'expired_token') : ok(1)), {
        auth: () => token,
        onAuthExpired
      })
      await Promise.all([transport('a.b'), transport('a.b')])
      expect(onAuthExpired).toHaveBeenCalledOnce()
    })
  })

  describe('abort', () => {
    it('passes the signal to fetch', async () => {
      const controller = new AbortController()
      const { transport, requests } = setup(() => ok(1))
      await transport('a.b', {}, controller.signal)
      expect(requests[0]?.init.signal).toBe(controller.signal)
    })

    it('combines the client signal with the call signal', async () => {
      const client = new AbortController()
      const call = new AbortController()
      const { transport, requests } = setup(() => ok(1), { signal: client.signal })
      await transport('a.b', {}, call.signal)
      const signal = requests[0]?.init.signal as AbortSignal
      expect(signal.aborted).toBe(false)
      client.abort()
      expect(signal.aborted).toBe(true)
    })

    it('stops retrying once aborted', async () => {
      const controller = new AbortController()
      const { transport, requests } = setup(() => fail(500, 'INTERNAL_SERVER_ERROR'))
      const result = transport('a.b', {}, controller.signal).catch((error: unknown) => error)
      await vi.advanceTimersByTimeAsync(5)
      controller.abort(new Error('stop'))
      expect(await result).toEqual(new Error('stop'))
      expect(requests).toHaveLength(1)
    })

    it('rethrows the abort reason instead of the fetch error', async () => {
      const controller = new AbortController()
      const fetch = vi.fn<typeof globalThis.fetch>(async () => {
        controller.abort(new Error('stop'))
        throw new DOMException('aborted', 'AbortError')
      })
      const transport = createTransport({ url: URL_BASE, fetch }, unlimited)
      await expect(transport('a.b', {}, controller.signal)).rejects.toThrow('stop')
    })

    it('rejects a retry delay when the signal aborts before it starts', async () => {
      const controller = new AbortController()
      const fetch = vi.fn<typeof globalThis.fetch>(async () => {
        const response = Response.json({ error: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
        return response
      })
      const limiter: Limiter = {
        acquire: () => Promise.resolve(),
        exhaust: () => {}
      }
      const transport = createTransport({ url: URL_BASE, fetch, retry: { delay: 10 } }, limiter)
      const result = transport('a.b', {}, controller.signal).catch((error: unknown) => error)
      controller.abort(new Error('early'))
      await vi.runAllTimersAsync()
      expect(await result).toEqual(new Error('early'))
    })
  })
})
