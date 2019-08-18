import range from 'lodash.range'
import {
  BitrixBatchPayload,
  BitrixCommand,
  BitrixCommands,
  BitrixGetPayload,
  BitrixListOptions,
  BitrixMethod
} from '../types'
import { MAX_COMMANDS_PER_BATCH } from './batch'

const MAX_ENTRIES_PER_COMMAND = 50
const MAX_ENTRIES_PER_BATCH = MAX_ENTRIES_PER_COMMAND * MAX_COMMANDS_PER_BATCH

const fillBatchCommands = (method: BitrixMethod, current: number, remained: number): BitrixCommands => {
  const requiresCommands = Math.ceil(remained / MAX_ENTRIES_PER_COMMAND)
  const commandsToDo = requiresCommands > MAX_COMMANDS_PER_BATCH
    ? MAX_COMMANDS_PER_BATCH
    : requiresCommands

  return range(0, commandsToDo).reduce((commands, i) => ({
    ...commands,
    [i]: { method, params: { start: current + (MAX_ENTRIES_PER_COMMAND * i) } }
  }), {})
}

const fillBatchesCommands = (method: BitrixMethod, start: number, toProcess: number): readonly BitrixCommands[] => {
  const requiresBatches = Math.ceil(toProcess / MAX_ENTRIES_PER_BATCH)

  return range(0, requiresBatches).reduce((batchesCommands, i) => {
    const processed = start + (MAX_ENTRIES_PER_BATCH * i)
    const remained = toProcess - processed

    return [ ...batchesCommands, fillBatchCommands(method, processed, remained)]
  }, [] as readonly BitrixCommands[])
}

interface Dependencies {
  readonly get: <P>(method: BitrixMethod, options: object) => Promise<BitrixGetPayload<P>>
  // tslint:disable-next-line no-mixed-interface
  readonly batch: <C extends Record<string, any>>(commands: Record<keyof C, BitrixCommand>) =>
    Promise<BitrixBatchPayload<C>>
}

export default ({ get, batch }: Dependencies) =>
  async <P>(method: BitrixMethod, options?: BitrixListOptions): Promise<BitrixGetPayload<readonly P[]>> => {
    const start = options && options.start || 0
    const firstCall = await get<readonly P[]>(method, { query: { start } })

    // tslint:disable-next-line no-if-statement
    if (!firstCall.next) return firstCall

    const toProcess = firstCall.total - start
    const batches = fillBatchesCommands(method, start, toProcess)
      .map((commands) => batch<Record<keyof typeof commands, readonly P[]>>(commands))

    return Promise.all(batches)
      .then((results) => {
        const commandsResults = results.reduce((result, batch) => {
          const commands = batch.result
          const res = Object.keys(commands).map((cmd) => commands[cmd])

          // @todo `flat: readonly P[]` is hacky since something goes wrong with types here
          const flatten = res.reduce((flat: readonly P[], payload) => {
            return Array.isArray(payload) ? [...flat, ...payload] : [...flat, payload]
          }, [] as readonly P[])

          return [...result, ...flatten]
        }, [] as ReadonlyArray<P>)

        // tslint:disable-next-line no-if-statement
        if (Object.keys(results.error).length > 0) {
          // tslint:disable-next-line no-throw
          throw new Error(
            `[batch] failed to process the batch. Received ${results.errors.length} errors.`
          )
        }

        return {
          error: undefined,
          // @todo
          next: undefined,
          result: commandsResults,
          total: firstCall.total
        }
      })
  }
