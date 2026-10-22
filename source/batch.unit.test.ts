import { describe, expect, it, vi } from 'vitest'
import { fakeFetch, ok } from './__fixtures__/bitrix.js'
import { chunk, createBatch } from './batch.js'
import { BitrixError } from './errors.js'
import { createTransport } from './transport.js'

const setup = (handler: Parameters<typeof fakeFetch>[0]) => {
  const fake = fakeFetch(handler)
  const transport = createTransport(
    { url: 'https://portal.bitrix24.com/rest/1/token', fetch: fake.fetch },
    { acquire: () => Promise.resolve(), exhaust: () => {} }
  )
  return { ...fake, batch: createBatch(transport) }
}

const batchReply = (result: unknown, resultError: unknown = []) =>
  ok({ result, result_error: resultError, result_total: [], result_next: [], result_time: [] })

describe('chunk', () => {
  it('splits items into groups of the given size', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
    expect(chunk([], 2)).toEqual([])
  })
})

describe('createBatch', () => {
  it('sends keyed commands as encoded query strings', async () => {
    const { batch, requests } = setup(() => batchReply({ deal: { ID: '1' }, fields: {} }))

    await batch({
      deal: { method: 'crm.deal.get', params: { id: 1 } },
      list: { method: 'crm.deal.list', params: { filter: { '>ID': 5 }, select: ['ID'] } },
      fields: { method: 'crm.deal.fields' }
    })

    expect(requests[0]?.method).toBe('batch')
    expect(requests[0]?.body).toEqual({
      halt: 0,
      cmd: {
        deal: 'crm.deal.get?id=1',
        list: 'crm.deal.list?filter%5B%3EID%5D=5&select%5B0%5D=ID',
        fields: 'crm.deal.fields'
      }
    })
  })

  it('returns keyed results and errors', async () => {
    const { batch } = setup(() =>
      batchReply({ deal: { ID: '1' } }, { missing: { error: '', error_description: 'Not found' } })
    )

    const { results, errors } = await batch({
      deal: { method: 'crm.deal.get', params: { id: 1 } },
      missing: { method: 'crm.deal.get', params: { id: 0 } }
    })

    expect(results).toEqual({ deal: { ID: '1' } })
    expect(errors.missing).toBeInstanceOf(BitrixError)
    expect(errors.missing).toMatchObject({
      code: 'COMMAND_FAILED',
      description: 'Not found',
      method: 'crm.deal.get',
      command: 'missing',
      message: 'crm.deal.get (command missing): COMMAND_FAILED Not found'
    })
  })

  it('keeps Bitrix error codes of failed commands', async () => {
    const { batch } = setup(() => batchReply([], { a: { error: 'insufficient_scope' } }))
    const { errors } = await batch({ a: { method: 'crm.deal.fields' } })
    expect(errors.a).toMatchObject({ code: 'insufficient_scope', description: '' })
  })

  it('names the batch method for errors on unknown commands', async () => {
    const { batch } = setup(() => batchReply([], { other: { error: 'X' } }))
    const { errors } = await batch({ a: { method: 'crm.deal.fields' } })
    expect((errors as Record<string, BitrixError>)['other']?.method).toBe('batch')
  })

  it('returns arrays for array commands', async () => {
    const { batch } = setup(() => batchReply([{ ID: '1' }, null], { '1': { error: 'NOT_FOUND' } }))

    const { results, errors } = await batch([
      { method: 'crm.deal.get', params: { id: 1 } },
      { method: 'crm.deal.get', params: { id: 2 } }
    ])

    expect(results).toEqual([{ ID: '1' }, null])
    expect(errors[0]).toBeUndefined()
    expect(errors[1]).toMatchObject({ code: 'NOT_FOUND', command: '1' })
  })

  it('splits more than 50 commands into several requests and merges the results', async () => {
    const { batch, requests } = setup((_method, body) =>
      batchReply(Object.fromEntries(Object.keys(body.cmd).map((key) => [key, Number(key)])))
    )
    const commands = Array.from({ length: 120 }, (_, id) => ({ method: 'crm.deal.get', params: { id } }) as const)

    const { results } = await batch(commands)

    expect(requests.map((request) => Object.keys(request.body.cmd).length)).toEqual([50, 50, 20])
    expect(results).toEqual(Array.from({ length: 120 }, (_, index) => index))
  })

  it('stops sending chunks after an error when halt is set', async () => {
    const { batch, requests } = setup((_method, body) =>
      batchReply({}, Object.keys(body.cmd).includes('0') ? { '3': { error: 'FAIL' } } : [])
    )
    const commands = Array.from({ length: 120 }, (_, id) => ({ method: 'crm.deal.get', params: { id } }) as const)

    const { errors } = await batch(commands, { halt: true })

    expect(requests).toHaveLength(1)
    expect(requests[0]?.body.halt).toBe(1)
    expect(errors[3]).toMatchObject({ code: 'FAIL' })
  })

  it('sends all chunks in order when halt is set and nothing fails', async () => {
    const { batch, requests } = setup(() => batchReply({}))
    const commands = Array.from({ length: 60 }, (_, id) => ({ method: 'crm.deal.get', params: { id } }) as const)
    await batch(commands, { halt: true })
    expect(requests).toHaveLength(2)
  })

  it('does not send a request for zero commands', async () => {
    const { batch, fetch } = setup(() => batchReply({}))
    await expect(batch({})).resolves.toEqual({ results: {}, errors: {} })
    expect(vi.mocked(fetch)).not.toHaveBeenCalled()
  })

  it('passes the abort signal', async () => {
    const controller = new AbortController()
    const { batch, requests } = setup(() => batchReply({}))
    await batch({ a: { method: 'crm.deal.fields' } }, { signal: controller.signal })
    expect(requests[0]?.init.signal).toBe(controller.signal)
  })
})
