import { GotInstance, GotJSONFn } from 'got'
import { stringify as toQuery } from 'qs'
import { BatchPayload, Command, Commands, Method } from '../../types'
import isArray from '../../utils/isArray'

export const MAX_COMMANDS_PER_BATCH = 50

/**
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

export const handleBatchPayload = <C>(payload: BatchPayload<C>): BatchPayload<C> => {
  const resultErrors = payload.result.result_error
  const errors = isArray(resultErrors) ? resultErrors : Object.values(resultErrors)

  // tslint:disable-next-line no-if-statement
  if (errors.length > 0) {
    // @todo We can give better formatting to display errored commands. But it's not important for now
    // tslint:disable-next-line no-throw
    throw new Error(`[batch] failed to process. Received errors in ${errors.length} commands:\n${errors.join('\n')}`)
  }

  return payload
}

export type Batch = <
  CPM extends { [K in keyof C]: unknown },
  C extends { [K in keyof CPM]: Command} = { [K in keyof CPM]: Command}
>(commands: C) => Promise<BatchPayload<CPM>>

export default ({ get }: GotInstance<GotJSONFn>): Batch => {
  /**
   * A complicated generics setup needed to properly map payload to commands names and back
   * <CPM> stands for commands payload map and allows to specify properly function result. When leaved blank,
   * function will do best to figure out possible result names based on commands, but payload will be `unknown`
   * <C> stands for commands list itself and it is inferred from `commands` argument, so it shouldn't be touched
   * <CPM> expected to be interface of the commands names mapped to their structural types:
   *
   * ```
   * interface Commands {
   *   dealsList: readonly Deal[]
   *   someLead: Lead
   * }
   *
   * const commands = {
   *  dealsList: { method. Method.LIST_DEALS },
   *  someLead: { method. Method.GET_LEAD, params: { ID: 11 } }
   * }
   *
   * batch<Commands>(commands).then((p) => p.result.dealList)
   *
   * // Will error
   * batch<Commands>({
   *  wrong: { method. Method.LIST_DEALS }
   * })
   * ```
   *
   * Batch also will properly figure out payload when array of commands provided. However,
   * in such case a generic Record with union of payloads should be provided
   *
   * ```
   * const commands = [
   *  { method. Method.LIST_DEALS },
   *  { method. Method.GET_LEAD, params: { ID: 11 } }
   * ]
   *
   * batch<Record<string, readonly Deal[] | Lead>(commands).then((p) => p.result.dealList)
   * ```
   *
   * Or when array of commands is a const, a tuple can be used to figure out exactly each result:
   *
   * ```
   * const commands = [
   *  { method. Method.LIST_DEALS },
   *  { method. Method.GET_LEAD, params: { ID: 11 } }
   * ] as const
   *
   * batch<[Deal[], Lead]>(commands).then(({ result }) => {
   *   const [deals, lead] = result
   * })
   *
   * // This will error due to wrong number of payloads
   * batch<[Deal[], Lead, Lead]>(commands)
   * ```
   */
  const batch: Batch = async <
    CPM extends { [K in keyof C]: unknown },
    C extends { [K in keyof CPM]: Command} = { [K in keyof CPM]: Command}
  >(commands: C): Promise<BatchPayload<CPM>> => {
    const commandsAmount = Object.keys(commands).length

    // tslint:disable-next-line no-if-statement
    if (commandsAmount > MAX_COMMANDS_PER_BATCH) {
      // tslint:disable-next-line no-throw
      throw new Error(
        `[batch] failed to process. Received ${commandsAmount} commands, but maximum ${MAX_COMMANDS_PER_BATCH} allowed`
      )
    }

    return get(Method.BATCH, { query: prepareCommandsQueries(commands) })
      .then(({ body }) => handleBatchPayload(body as BatchPayload<CPM>))
  }

  return batch
}
