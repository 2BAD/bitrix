import range from 'lodash.range'
import {
  Command,
  Commands,
  ListableMethod,
  ListParams,
  ListPayload,
  BatchPayload
} from '../../types'
import { Batch } from './batch'
import { GetList } from './getList'

const MAX_ENTRIES_PER_COMMAND = 50

const fillWithCommands = (
  { method, params }: Command,
  start: number,
  toProcess: number,
  entriesPerCommand: number
): Commands => {
  const requiresCommands = Math.ceil(toProcess / entriesPerCommand)

  return range(0, requiresCommands)
    .map((i) => ({ method, params: { ...params, start: start + (entriesPerCommand * i) } }), {})
}

const batchToListPayload = <P>(payload: BatchPayload<Record<string | number, readonly P[]>>): ListPayload<P> => {
  const { result: { result, result_total }, time } = payload
  const flattenResult = Object.entries(result)
    .reduce((flatten, [_key, r]) => !r ? flatten : [...flatten, ...r], [] as readonly P[])

  return {
    error: undefined,
    next: undefined,
    result: flattenResult ? flattenResult : [],
    // @todo Not accurate, we do not care
    time,
    total: result_total[0] || 0
  }
}

interface Dependencies {
  readonly getList: GetList
  readonly batch: Batch
}

export type List = <P>(method: ListableMethod, params?: ListParams) => Promise<ListPayload<P>>

export default ({ getList, batch }: Dependencies): List => {
  const list: List = async <P>(method: ListableMethod, params: ListParams = {}): Promise<ListPayload<P>> => {
    const start = params.start || 0

    const listAll = async () => {
      const toProcess = firstCall.total - start
      const batchCommands = fillWithCommands({ method, params }, start, toProcess, MAX_ENTRIES_PER_COMMAND)

      const payload = await batch<Record<string | number, readonly P[]>>(batchCommands)
      const errors = payload.result.result_error

      // tslint:disable-next-line no-if-statement
      if (errors.length && errors.length > 0) {
        // tslint:disable-next-line no-throw
        throw new Error(
          `[list] failed to process the list. Received ${errors.length} errors.`
        )
      }

      return batchToListPayload(payload)
    }

    const firstCall = await getList<P>(method, { ...params, start })

    return !firstCall.next ? firstCall : listAll()
  }

  return list
}
