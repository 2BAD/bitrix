import { GotInstance, GotJSONFn } from 'got'
import { BitrixBatchPayload, BitrixCommands, BitrixMethod } from '../types'
import makeBitrixURIParams from '../utils/makeBitrixURIParams'

export const MAX_COMMANDS_PER_BATCH = 50

const commandsToBatchQuery = (commands: BitrixCommands): Record<string, string> =>
  Object.keys(commands).reduce((result, cmdName) => {
    const { method, params } = commands[cmdName]
    const paramsString = params ? `?${makeBitrixURIParams(params)}` : ''

    return {
      ...result,
      [`cmd[${cmdName}]`]: `${method}${paramsString}`
    }
  }, {})

const handleBatchPayload = <P>(payload: BitrixBatchPayload<P>) => {
  // tslint:disable-next-line no-if-statement
  if (payload.error && Object.keys(payload.error).length > 0) {
  // tslint:disable-next-line no-throw
    throw new Error(`[batch] failed to process. Received ${payload.error.length} errors.`)
  }

  return payload
}

export default ({ get }: GotInstance<GotJSONFn>) =>
  <P>(commands: BitrixCommands): Promise<BitrixBatchPayload<P>> => {
    const commandsAmount = Object.keys(commands).length

    // tslint:disable-next-line no-if-statement
    if (commandsAmount > MAX_COMMANDS_PER_BATCH) {
      // tslint:disable-next-line no-throw
      throw new Error(
        `[batch] failed to process. Received ${commandsAmount} commands, but maximum ${MAX_COMMANDS_PER_BATCH} allowed`
      )
    }

    return get(BitrixMethod.BATCH, { query: commandsToBatchQuery(commands) })
      .then(({ body }) => handleBatchPayload(body as BitrixBatchPayload<P>))
  }
