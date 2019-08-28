import { GotInstance, GotJSONFn } from 'got'
import { stringify as stringifyQuery } from 'querystring'
import { BatchPayload, Command, Commands, Method } from '../../types'
import isArray from '../../utils/isArray'

export const MAX_COMMANDS_PER_BATCH = 50

export const commandsToBatchQuery = (commands: Commands): Record<string, string> =>
  Object.entries(commands).reduce((queries, [cmdName, command]) => {
    const stringifiedParams = command.params ? `?${stringifyQuery(command.params)}` : ''

    return {
      ...queries,
      [`cmd[${cmdName}]`]: `${command.method}${stringifiedParams}`
    }
  }, {})

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

// `C` generic expected to be interface of the commands names mapped to their structural types:
//
//  ```
//  interface Commands {
//    dealsList: readonly Deal[]
//    someLead: Lead
//  }
//  ```
//
// Or a generic Record can be passed in keys are unknown:
//
// ```
// Record<string, readonly Deal[]>
// ```
//
// @todo `any` in `Record<string, any>` better to be another generic, but TS so far does not allow
//       partial generic application without loosing the type inference
export default ({ get }: GotInstance<GotJSONFn>) =>
  async <C extends Record<string, any>>(commands: Record<keyof C, Command>): Promise<BatchPayload<C>> => {
    const commandsAmount = Object.keys(commands).length

    // tslint:disable-next-line no-if-statement
    if (commandsAmount > MAX_COMMANDS_PER_BATCH) {
      // tslint:disable-next-line no-throw
      throw new Error(
        `[batch] failed to process. Received ${commandsAmount} commands, but maximum ${MAX_COMMANDS_PER_BATCH} allowed`
      )
    }

    return get(Method.BATCH, { query: commandsToBatchQuery(commands) })
      .then(({ body }) => handleBatchPayload(body as BatchPayload<C>))
  }
