import { GotInstance, GotJSONFn } from 'got'
import { BitrixBatchPayload, BitrixCommand, BitrixCommands, BitrixMethod } from '../types'
import makeBitrixURIParams from '../utils/makeBitrixURIParams'

export const MAX_COMMANDS_PER_BATCH = 50

const commandsToBatchQuery = (commands: BitrixCommands): Record<string, string> =>
  Object.keys(commands).reduce((queries, cmdName) => {
    const { method, params } = commands[cmdName]
    const paramsString = params ? `?${makeBitrixURIParams(params)}` : ''

    return {
      ...queries,
      [`cmd[${cmdName}]`]: `${method}${paramsString}`
    }
  }, {})

const handleBatchPayload = <C>(payload: BitrixBatchPayload<C>) => {
  const commandsErrored = payload.result.result_error && Object.keys(payload.result.result_error)

  // tslint:disable-next-line no-if-statement
  if (commandsErrored && commandsErrored.length > 0) {
  // tslint:disable-next-line no-throw
    throw new Error(`[batch] failed to process. Received errors in ${commandsErrored.length} commands.`)
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
  <C extends Record<string, any>>(commands: Record<keyof C, BitrixCommand>): Promise<BitrixBatchPayload<C>> => {
    const commandsAmount = Object.keys(commands).length

    // tslint:disable-next-line no-if-statement
    if (commandsAmount > MAX_COMMANDS_PER_BATCH) {
      // tslint:disable-next-line no-throw
      throw new Error(
        `[batch] failed to process. Received ${commandsAmount} commands, but maximum ${MAX_COMMANDS_PER_BATCH} allowed`
      )
    }

    return get(BitrixMethod.BATCH, { query: commandsToBatchQuery(commands) })
      .then(({ body }) => handleBatchPayload(body as BitrixBatchPayload<C>))
  }
