import { encode } from './encode.js'
import { BitrixError } from './errors.js'
import type { Method, Params, Result } from './methods.js'
import type { Transport } from './transport.js'

export const MAX_COMMANDS_PER_BATCH = 50

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

export const chunk = <T>(items: readonly T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, (index + 1) * size))

const toCommand = ({ method, params }: Command) => {
  const query = params ? encode(params) : ''
  return query === '' ? method : `${method}?${query}`
}

/**
 * Runs any number of commands through `batch`, 50 per request. Keyed commands give keyed results,
 * arrays give arrays. A failed command lands in `errors` and does not reject the whole call
 */
export const createBatch = (transport: Transport): Batch => {
  const send = async (
    entries: ReadonlyArray<readonly [string, Command]>,
    { halt = false, signal }: BatchOptions
  ): Promise<{ results: Record<string, unknown>; errors: Record<string, BitrixError> }> => {
    const cmd = Object.fromEntries(entries.map(([key, command]) => [key, toCommand(command)]))
    const { result } = (await transport('batch', { halt: halt ? 1 : 0, cmd }, signal)) as { result: BatchEnvelope }
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
    return { results: result.result as Record<string, unknown>, errors }
  }

  return (async (commands: Commands, options: BatchOptions = {}) => {
    const entries = Object.entries(commands)
    const chunks = chunk(entries, MAX_COMMANDS_PER_BATCH)

    const responses = []
    if (options.halt) {
      for (const group of chunks) {
        const response = await send(group, options)
        responses.push(response)
        if (Object.keys(response.errors).length > 0) break
      }
    } else {
      responses.push(...(await Promise.all(chunks.map((group) => send(group, options)))))
    }

    const results = Object.assign({}, ...responses.map((response) => response.results))
    const errors = Object.assign({}, ...responses.map((response) => response.errors))
    return Array.isArray(commands)
      ? { results: entries.map(([key]) => results[key]), errors: entries.map(([key]) => errors[key]) }
      : { results, errors }
  }) as Batch
}
