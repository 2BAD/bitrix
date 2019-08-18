import range from 'lodash.range'
import {
  BitrixBatchPayload,
  BitrixCommand,
  BitrixCommands,
  BitrixListOptions,
  BitrixListPayload,
  BitrixMethod
} from '../types'
import isArray from '../utils/isArray'
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
  readonly getList: <P>(method: BitrixMethod, options: object) => Promise<BitrixListPayload<P>>
  // tslint:disable-next-line no-mixed-interface
  readonly batch: <C extends Record<string, any>>(commands: Record<keyof C, BitrixCommand>) =>
    Promise<BitrixBatchPayload<C>>
}

export default ({ getList, batch }: Dependencies) =>
  async <P>(method: BitrixMethod, options?: BitrixListOptions): Promise<BitrixListPayload<P>> => {
    const start = options && options.start || 0
    const firstCall = await getList<P>(method, { query: { start } })

    // tslint:disable-next-line no-if-statement
    if (!firstCall.next) return firstCall

    const toProcess = firstCall.total - start
    const batches = fillBatchesCommands(method, start, toProcess)
      .map((commands) => batch<Record<keyof typeof commands, readonly P[]>>(commands))

    return Promise.all(batches)
      .then((batchesResults) => {
        const flattenBatches = batchesResults.reduce((collectedFlattenBatches, batchesResult) => {
          const { result } = batchesResult.result
          const flattenCommands = isArray(result)
            ? result.reduce((res, r) => [...res, ...r], [] as readonly P[])
            : Object.values(result)
                .reduce((res, r) => {
                  // tslint:disable-next-line no-if-statement
                  if (!res || !r) return []
                  return [...res, ...r]
                }, [] as readonly P[])

          return [...collectedFlattenBatches, ...(flattenCommands ? flattenCommands : [])]
        }, [] as ReadonlyArray<P>)

        // // tslint:disable-next-line no-if-statement
        // if (Object.keys(results.error).length > 0) {
        //   // tslint:disable-next-line no-throw
        //   throw new Error(
        //     `[batch] failed to process the batch. Received ${results.errors.length} errors.`
        //   )
        // }

        return {
          error: undefined,
          // @todo
          next: undefined,
          result: flattenBatches,
          // @todo Not accurate, we do not care
          time: firstCall.time,
          total: firstCall.total
        }
      })
  }
