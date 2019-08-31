import range from 'lodash.range'
import {
  BatchPayload,
  Command,
  Commands,
  ListableMethod,
  ListParams,
  ListPayload
} from '../../types'
import { Batch } from './batch'
import { GetList } from './getList'

const MAX_ENTRIES_PER_COMMAND = 50

/**
 * Generates required amount of commands to process specified amount of entries
 */
export const fillWithCommands = (
  { method, params }: Command,
  start: number,
  toProcess: number,
  entriesPerCommand: number
): Commands => {
  const requiresCommands = Math.ceil((toProcess - start) / entriesPerCommand)

  return range(0, requiresCommands)
    .map((i) => ({ method, params: { ...params, start: start + (entriesPerCommand * i) } }), {})
}

/**
 * Converts batch payload to a list payload
 */
const batchToListPayload = <P>(payload: BatchPayload<Record<string | number, readonly P[]>>): ListPayload<P> => {
  const { result: { result, result_total, result_error, result_next }, time } = payload

  const flattenResult = Object.entries(result).reduce(
    (flatten, [_key, r]) => !r ? flatten : [...flatten, ...r]
  , [] as readonly P[])

  /**
   * Get the highest value from object or an array if there's any
   */
  const highest = (input: ReadonlyArray<number | undefined> | Record<string, number | undefined>): number | undefined =>
    Object.values(input).reduce(
      (a, b) => a === undefined || b === undefined ? undefined : a > b ? a : b
    , 0)

  return {
    error: Object.values(result_error).join('\n'),
    next: highest(result_next),
    result: flattenResult,
    // @todo Not accurate, we do not care
    time,
    total: highest(result_total) || 0
  }
}

interface Dependencies {
  readonly getList: GetList
  readonly batch: Batch
}

export type List = <P>(method: ListableMethod, params?: ListParams) => Promise<ListPayload<P>>

/**
 * Gets all entries by dispatching required amount of requests
 */
export default ({ getList, batch }: Dependencies): List => {
  const list: List = async <P>(method: ListableMethod, params: ListParams = {}): Promise<ListPayload<P>> => {
    const start = params.start || 0

    const listAll = async () => {
      const batchCommands = fillWithCommands({ method, params }, start, firstCall.total, MAX_ENTRIES_PER_COMMAND)
      const payload = await batch<Record<string | number, readonly P[]>>(batchCommands)

      return batchToListPayload(payload)
    }

    const firstCall = await getList<P>(method, { ...params, start })

    return !firstCall.next ? firstCall : listAll()
  }

  return list
}
