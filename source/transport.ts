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

export type RequestEvent = {
  readonly method: string
  readonly params: Readonly<Record<string, unknown>>
  /** Zero based number of the request within one call, retries and token refreshes included */
  readonly attempt: number
}

export type ResponseEvent = {
  readonly method: string
  readonly attempt: number
  /** Milliseconds from sending the request to parsing the response */
  readonly duration: number
  readonly time?: Time
  readonly error?: unknown
}

export type TransportOptions = {
  readonly url: string
  readonly auth?: string | (() => string | Promise<string>)
  readonly onAuthExpired?: () => void | Promise<void>
  readonly fetch?: typeof fetch
  readonly signal?: AbortSignal
  /** Called right before every HTTP request, after the rate limiter let it through */
  readonly onRequest?: (event: RequestEvent) => void
  /** Called after every HTTP request, with `error` set when it failed */
  readonly onResponse?: (event: ResponseEvent) => void
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
 * @param resetAt when the limit resets, in milliseconds since the epoch
 * @param delay base backoff delay in milliseconds
 * @param attempt zero based retry attempt
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
 * @param options endpoint, auth, fetch and hook settings
 * @param limiter rate limiter every request waits for
 * @param retry how often and how long to wait before retrying
 * @param retry.retries attempts after the first one
 * @param retry.delay base backoff delay in milliseconds
 */
export const createTransport = (
  options: TransportOptions,
  limiter: Limiter,
  { retries, delay }: Required<RetryOptions>
): Transport => {
  const { auth, onAuthExpired } = options
  const fetcher = options.fetch ?? ((input, init) => globalThis.fetch(input, init))
  const base = new URL(options.url.endsWith('/') ? options.url : `${options.url}/`)
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

  const request = async (
    method: string,
    params: Readonly<Record<string, unknown>>,
    signal: AbortSignal | undefined
  ) => {
    const token = typeof auth === 'function' ? await auth() : auth
    const response = await fetcher(new URL(method, base), {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(token === undefined ? params : { ...params, auth: token }),
      ...(signal && { signal })
    })
    return parse(response, method)
  }

  const send = async (
    method: string,
    params: Readonly<Record<string, unknown>>,
    signal: AbortSignal | undefined,
    attempt: number
  ) => {
    await limiter.acquire(signal)
    options.onRequest?.({ method, params, attempt })
    const started = Date.now()
    let envelope: Envelope<unknown>
    try {
      envelope = await request(method, params, signal)
    } catch (error) {
      options.onResponse?.({ method, attempt, duration: Date.now() - started, error })
      throw error
    }
    options.onResponse?.({
      method,
      attempt,
      duration: Date.now() - started,
      ...(envelope.time && { time: envelope.time })
    })
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
    let sent = 0

    for (let attempt = 0; ; attempt++) {
      try {
        return await send(method, params, signal, sent++)
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
