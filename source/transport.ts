import { BitrixError } from './errors.js'
import type { Limiter } from './limiter.js'

export type Time = {
  readonly start: number
  readonly finish: number
  readonly duration: number
  readonly processing: number
  readonly date_start: string
  readonly date_finish: string
  readonly operating?: number
  readonly operating_reset_at?: number
}

export type Envelope<R> = {
  readonly result: R
  readonly time: Time
  readonly total?: number
  readonly next?: number
}

export type RetryOptions = {
  readonly retries?: number
  readonly delay?: number
}

export type TransportOptions = {
  readonly url: string
  readonly auth?: string | (() => string | Promise<string>)
  readonly onAuthExpired?: () => void | Promise<void>
  readonly fetch?: typeof fetch
  readonly retry?: RetryOptions
  readonly signal?: AbortSignal
}

export type Transport = (
  method: string,
  params?: Readonly<Record<string, unknown>>,
  signal?: AbortSignal
) => Promise<Envelope<unknown>>

const RETRYABLE_CODES = new Set(['QUERY_LIMIT_EXCEEDED', 'OPERATION_TIME_LIMIT', 'INTERNAL_SERVER_ERROR'])

export const sleep = (ms: number, signal: AbortSignal | undefined) =>
  new Promise<void>((resolve, reject) => {
    const onAbort = () => {
      clearTimeout(timer)
      reject(signal?.reason)
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    signal?.addEventListener('abort', onAbort, { once: true })
  })

/**
 * Time to wait before retrying an operating time limit error: until the limit resets when Bitrix said when,
 * exponential backoff otherwise
 */
export const operatingDelay = (resetAt: number | undefined, delay: number, attempt: number) =>
  resetAt !== undefined && resetAt > Date.now() ? resetAt - Date.now() : delay * 2 ** attempt

const isRetryable = (error: unknown) =>
  error instanceof BitrixError
    ? RETRYABLE_CODES.has(error.code) || (error.status !== undefined && error.status >= 500)
    : error instanceof TypeError

const parse = async (response: Response, method: string): Promise<Envelope<unknown>> => {
  const text = await response.text()
  let body: Record<string, unknown>
  try {
    body = JSON.parse(text)
  } catch (cause) {
    throw new BitrixError({
      code: 'INVALID_RESPONSE',
      description: `expected JSON, received ${text.slice(0, 100)}`,
      method,
      status: response.status,
      cause
    })
  }

  if (!response.ok || 'error' in body) {
    throw new BitrixError({
      code: typeof body['error'] === 'string' && body['error'] !== '' ? body['error'] : `HTTP_${response.status}`,
      description: typeof body['error_description'] === 'string' ? body['error_description'] : response.statusText,
      method,
      status: response.status
    })
  }

  return body as Envelope<unknown>
}

/**
 * Sends a single REST method call as a JSON POST, applying auth, rate limiting and retries
 */
export const createTransport = (options: TransportOptions, limiter: Limiter): Transport => {
  const { auth, onAuthExpired, retry = {} } = options
  const fetcher = options.fetch ?? ((input, init) => globalThis.fetch(input, init))
  const { retries = 3, delay = 1000 } = retry
  const base = options.url.endsWith('/') ? options.url : `${options.url}/`
  const operatingResetAt = new Map<string, number>()
  let refreshing: Promise<void> | undefined

  const refreshAuth = async () => {
    refreshing ??= (async () => {
      try {
        await onAuthExpired?.()
      } finally {
        refreshing = undefined
      }
    })()
    await refreshing
  }

  const send = async (method: string, params: Readonly<Record<string, unknown>>, signal: AbortSignal | undefined) => {
    await limiter.acquire(signal)
    const token = typeof auth === 'function' ? await auth() : auth
    const response = await fetcher(new URL(method, base), {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(token === undefined ? params : { ...params, auth: token }),
      ...(signal && { signal })
    })
    const envelope = await parse(response, method)
    if (envelope.time?.operating_reset_at !== undefined) {
      operatingResetAt.set(method, envelope.time.operating_reset_at * 1000)
    }
    return envelope
  }

  const backoff = (error: unknown, method: string, attempt: number) => {
    if (error instanceof BitrixError && error.code === 'QUERY_LIMIT_EXCEEDED') {
      limiter.exhaust()
      return 0
    }
    if (error instanceof BitrixError && error.code === 'OPERATION_TIME_LIMIT') {
      return operatingDelay(operatingResetAt.get(method), delay, attempt)
    }
    return delay * 2 ** attempt
  }

  return async (method, params = {}, callSignal) => {
    const signals = [options.signal, callSignal].filter((signal) => signal !== undefined)
    const signal = signals.length > 1 ? AbortSignal.any(signals) : signals[0]
    let refreshed = false

    for (let attempt = 0; ; attempt++) {
      try {
        return await send(method, params, signal)
      } catch (error) {
        if (signal?.aborted) throw signal.reason
        if (error instanceof BitrixError && error.code === 'expired_token' && onAuthExpired && !refreshed) {
          refreshed = true
          await refreshAuth()
          attempt--
          continue
        }
        if (attempt >= retries || !isRetryable(error)) throw error
        await sleep(backoff(error, method, attempt), signal)
      }
    }
  }
}
