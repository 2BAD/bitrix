import { encode } from './encode.js'
import { BitrixError } from './errors.js'
import type { Method, Params, Result } from './methods.js'
import { type Envelope, operatingDelay, type RetryOptions, sleep, type Transport } from './transport.js'

export const MAX_COMMANDS_PER_BATCH = 50

const OPERATION_TIME_LIMIT = 'OPERATION_TIME_LIMIT'

export type Command<M extends Method = Method> = {
  readonly method: M
  readonly params?: Params<M>
}

type Commands = Readonly<Record<string, Command>> | readonly Command[]

type Checked<C extends Commands> = {
  readonly [K in keyof C]: C[K] extends { readonly method: infer M extends string } ? Command<M> : C[K]
}

export type BatchResult<C extends Commands> = {
  readonly results: {
    -readonly [K in keyof C]?: C[K] extends { readonly method: infer M extends string } ? Result<M> : never
  }
  readonly errors: { -readonly [K in keyof C]?: BitrixError }
}

export type BatchOptions = {
  readonly halt?: boolean
  readonly signal?: AbortSignal
}

export type Batch = <const C extends Commands>(
  commands: C & Checked<C>,
  options?: BatchOptions
) => Promise<BatchResult<C>>

type RawError = { readonly error?: string; readonly error_description?: string }

type BatchEnvelope = {
  readonly result: Readonly<Record<string, unknown>> | readonly unknown[]
  readonly result_error: Readonly<Record<string, RawError>> | readonly RawError[]
}

type Entries = ReadonlyArray<readonly [string, Command]>

type Response = {
  readonly results: Readonly<Record<string, unknown>>
  readonly errors: Readonly<Record<string, BitrixError>>
  readonly resetAt: number | undefined
}

const chunk = <T>(items: readonly T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, (index + 1) * size))

const toCommand = ({ method, params }: Command) => {
  const query = params ? encode(params) : ''
  return query === '' ? method : `${method}?${query}`
}

/**
 * Runs any number of commands through `batch`, 50 per request. Keyed commands give keyed results,
 * arrays give arrays. A failed command lands in `errors` and does not reject the whole call.
 * Commands that hit the operating time limit are sent again once the limit resets, unless they
 * reference results of other commands with `$result`
 */
export const createBatch = (transport: Transport, { retries = 3, delay = 1000 }: RetryOptions = {}): Batch => {
  const send = async (entries: Entries, { halt = false, signal }: BatchOptions): Promise<Response> => {
    const cmd = Object.fromEntries(entries.map(([key, command]) => [key, toCommand(command)]))
    const { result, time } = (await transport('batch', { halt: halt ? 1 : 0, cmd }, signal)) as Envelope<BatchEnvelope>
    const methods = new Map(entries.map(([key, command]) => [key, command.method]))
    const errors = Object.fromEntries(
      Object.entries(result.result_error).map(([key, raw]) => [
        key,
        new BitrixError({
          code: raw.error || 'COMMAND_FAILED',
          description: raw.error_description ?? '',
          method: methods.get(key) ?? 'batch',
          command: key
        })
      ])
    )
    const resetAt = time?.operating_reset_at === undefined ? undefined : time.operating_reset_at * 1000
    return { results: { ...result.result }, errors, resetAt }
  }

  const retryable = (entries: Entries, { results, errors }: Response, halt: boolean) => {
    const limited = entries.filter(([key]) => errors[key]?.code === OPERATION_TIME_LIMIT)
    if (limited.length === 0) return []
    const skipped = halt ? entries.filter(([key]) => !(key in results) && !(key in errors)) : []
    return [...limited, ...skipped].filter(([, command]) => !JSON.stringify(command.params ?? {}).includes('$result'))
  }

  const run = async (entries: Entries, options: BatchOptions): Promise<Response> => {
    let response = await send(entries, options)
    for (let attempt = 0; attempt < retries; attempt++) {
      const again = retryable(entries, response, options.halt ?? false)
      if (again.length === 0) break
      await sleep(operatingDelay(response.resetAt, delay, attempt), options.signal)
      const retried = await send(again, options)
      const keys = new Set(again.map(([key]) => key))
      response = {
        results: { ...response.results, ...retried.results },
        errors: {
          ...Object.fromEntries(Object.entries(response.errors).filter(([key]) => !keys.has(key))),
          ...retried.errors
        },
        resetAt: retried.resetAt
      }
    }
    return response
  }

  return (async (commands: Commands, options: BatchOptions = {}) => {
    const entries = Object.entries(commands)
    const chunks = chunk(entries, MAX_COMMANDS_PER_BATCH)

    const responses = []
    if (options.halt) {
      for (const group of chunks) {
        const response = await run(group, options)
        responses.push(response)
        if (Object.keys(response.errors).length > 0) break
      }
    } else {
      responses.push(...(await Promise.all(chunks.map((group) => run(group, options)))))
    }

    const results = Object.assign({}, ...responses.map((response) => response.results))
    const errors = Object.assign({}, ...responses.map((response) => response.errors))
    return Array.isArray(commands)
      ? { results: entries.map(([key]) => results[key]), errors: entries.map(([key]) => errors[key]) }
      : { results, errors }
  }) as Batch
}
