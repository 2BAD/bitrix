import { GotJSONFn } from 'got'
import chunk from 'lodash.chunk'
import fromPairs from 'lodash.frompairs'
import { stringify as toQuery } from 'qs'
import { Commands } from '../../commands'
import { Method, MethodPayloadType } from '../../methods'
import { BatchPayload } from '../../payloads'
import isArray from '../../utils/isArray'
import { handlePayload } from './call'

export const MAX_COMMANDS_PER_BATCH = 50

/**
 * Split any number of commands into the chunks with max commands per batch in each chunk
 */
export const chunkCommands = <C extends Commands>(
  commands: C,
  size: number = MAX_COMMANDS_PER_BATCH
): ReadonlyArray<C> => {
  const commandsIsArray = isArray(commands)
  const chunks = chunk(Object.entries(commands), size)

  // @todo Generated return type isn't very accurate since it says that it will make array of <C>, while
  //       in fact <C> will be distributed among chunks. That gives wrong hints with named commands and arrays as const.
  return chunks.map(
    (c) => commandsIsArray
      // @todo Figure out how to avoid unsafe casting to <C> here
      //       Without `<C>` generic it won't work with complex functions like `batch`
      ? c.map(([_key, command]) => command) as unknown as C
      : fromPairs(c) as C
  )
}

/**
 * Prepares list of commands to be used in requests to the Bitrix
 * @note We could avoid that function... if only Bitrix API would support posting of the batch commands as
 *       plain objects, like it does with other methods. Instead, it should be a dict or array of string queries
 */
export const prepareCommandsQueries = <C extends Commands, R = { [K in keyof C]: string }>(commands: C): R =>
  Object.entries(commands).reduce((calls, [name, { method, params }]) => {
    const stringifiedParams = params ? `?${toQuery(params)}` : ''

    return {
      ...calls,
      [`cmd[${name}]`]: `${method}${stringifiedParams}`
    }
  // tslint:disable-next-line: no-object-literal-type-assertion
  }, {} as R)

/**
 * Merges list of batch responses into a single batch
 * @todo Generics inference is complicated here and might be not super accurate
 */
export const mergeBatchPayloads = <
  B extends BatchPayload<any>,
  P = B extends BatchPayload<infer U> ? U : never
>(payloads: ReadonlyArray<B>): BatchPayload<P> => {
  const merge = <T extends S, S extends readonly any[] | Record<string, any>>(a: T, b: S): T =>
    isArray(a) && isArray(b)
      // @todo Gotta find way to avoid unsafe casting here
      ? [...a, ...b] as unknown as T
      : ({ ...a, ...b })

  return payloads.reduce((merged, payload) => ({
    result: {
      result: merge(merged.result.result || [], payload.result.result),
      result_error: merge(merged.result.result_error || [], payload.result.result_error),
      result_next: merge(merged.result.result_next || [], payload.result.result_next),
      result_time: merge(merged.result.result_time || [], payload.result.result_time),
      result_total: merge(merged.result.result_total || [], payload.result.result_total)
    },
    time: { ...merged.time, ...payload.time }
  // tslint:disable-next-line: no-object-literal-type-assertion
  }), { result: {}, time: {} } as BatchPayload<P>)
}

export type CommandsPayloads<
  C extends Commands,
  CM = {
    [K in keyof C]: C[K] extends { readonly method: infer M } ? M : never
  }
  > = {
  [K in keyof CM]: MethodPayloadType<CM[K] extends Method ? CM[K] : never>
}

// @todo Using `CommandsWithRequiredParamsTypes` and `Batch2` we could ensure that only supported commands
//       are supplied to the `batch`, but it results in unknown error when assigning `Batch2` to `batch` constant.

// export type CommandsWithRequiredParamsTypes<
//   C extends Commands,
//   CC = {
//     [K in keyof C]: C[K] extends Command ? {
//       method: C[K]['method'], params: MethodParams<C[K]['method']>
//     } : Command
//   },
// > = CC

// export type Batch2 = <
//   C extends Commands & { [K in keyof CC]: CC[K] },
//   CC = CommandsWithRequiredParamsTypes<C>,
//   P = CommandsPayloads<C>
// >(commands: C, commandsPerRequest?: number) => Promise<BatchPayload<P>>

export type Batch = <
  C extends Commands,
  P = CommandsPayloads<C>
>(commands: C, commandsPerRequest?: number) => Promise<BatchPayload<P>>

interface Dependencies {
  readonly get: GotJSONFn
}

/**
 * Dispatches a batch request with specified commands. Will fill figure out payload type based on the Methods.
 * Supports unlimited number of commands. If they do exceed max amount of commands per batch, will dispatch
 * multiple request and merge result into single batch payload
 * @todo For now due to issues with types it won't check `params` of command, so any Method can be used
 *       with any (even wrong) params
 */
export default ({ get }: Dependencies): Batch => {
  const batch: Batch = async <
    C extends Commands,
    P = CommandsPayloads<C>
  >(
    commands: C,
    commandsPerRequest: number = MAX_COMMANDS_PER_BATCH
  ): Promise<BatchPayload<P>> => {
    const call = (c: C) =>
      get(Method.BATCH, { query: prepareCommandsQueries(c) })
        .then(({ body }) => body as BatchPayload<P>)

    const calls = chunkCommands(commands, commandsPerRequest)
      .map(call)

    return Promise.all(calls)
      .then((chunkedPayloads) => {
        const payloads = mergeBatchPayloads(chunkedPayloads)
        return handlePayload(payloads)
      })
  }

  return batch
}
