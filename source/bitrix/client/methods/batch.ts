import { GotInstance, GotJSONFn } from 'got'
import { stringify as stringifyQuery } from 'querystring'
import { BitrixBatchPayload, BitrixCommand, BitrixCommands, BitrixMethod } from '../../types'
import isArray from '../../utils/isArray'

export const MAX_COMMANDS_PER_BATCH = 50

export const commandsToBatchQuery = (commands: BitrixCommands): Record<string, string> =>
  Object.entries(commands).reduce((queries, [cmdName, command]) => {
    const stringifiedParams = command.params ? `?${stringifyQuery(command.params)}` : ''

    return {
      ...queries,
      [`cmd[${cmdName}]`]: `${command.method}${stringifiedParams}`
    }
  }, {})

export const handleBatchPayload = <C>(payload: BitrixBatchPayload<C>): BitrixBatchPayload<C> => {
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

export default ({ get }: GotInstance<GotJSONFn>) => {
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
   *  dealsList: { method. BitrixMethod.LIST_DEALS },
   *  someLead: { method. BitrixMethod.GET_LEAD, params: { ID: 11 } }
   * }
   *
   * batch<Commands>(commands).then((p) => p.result.dealList)
   *
   * // Will error
   * batch<Commands>({
   *  wrong: { method. BitrixMethod.LIST_DEALS }
   * })
   * ```
   *
   * Batch also will properly figure out payload when array of commands provided. However,
   * in such case a generic Record with union of payloads should be provided
   *
   * ```
   * const commands = [
   *  { method. BitrixMethod.LIST_DEALS },
   *  { method. BitrixMethod.GET_LEAD, params: { ID: 11 } }
   * ]
   *
   * batch<Record<string, readonly Deal[] | Lead>(commands).then((p) => p.result.dealList)
   * ```
   *
   * Or when array of commands is a const, a tuple can be used to figure out exactly each result:
   *
   * ```
   * const commands = [
   *  { method. BitrixMethod.LIST_DEALS },
   *  { method. BitrixMethod.GET_LEAD, params: { ID: 11 } }
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
  return async <
    CPM extends { [K in keyof C]: unknown },
    C extends { [K in keyof CPM]: BitrixCommand} = { [K in keyof CPM]: BitrixCommand}
  >(commands: C): Promise<BitrixBatchPayload<CPM>> => {
    const commandsAmount = Object.keys(commands).length

    // tslint:disable-next-line no-if-statement
    if (commandsAmount > MAX_COMMANDS_PER_BATCH) {
      // tslint:disable-next-line no-throw
      throw new Error(
        `[batch] failed to process. Received ${commandsAmount} commands, but maximum ${MAX_COMMANDS_PER_BATCH} allowed`
      )
    }

    return get(BitrixMethod.BATCH, { query: commandsToBatchQuery(commands) })
      .then(({ body }) => handleBatchPayload(body as BitrixBatchPayload<CPM>))
  }
}
