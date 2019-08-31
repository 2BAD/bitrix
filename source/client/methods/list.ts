import range from 'lodash.range'
import {
  Command,
  Commands,
  ListableMethod,
  ListParams,
  ListPayload
} from '../../types'
import isArray from '../../utils/isArray'
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

  return range(0, requiresCommands).reduce((commands, i) => ({
    ...commands,
    [i]: { method, params: { ...params, start: start + (entriesPerCommand * i) } }
  }), {})
}

interface Dependencies {
  readonly getList: GetList
  readonly batch: Batch
}

export type List = <P>(method: ListableMethod, params?: ListParams) => Promise<ListPayload<P>>

export default ({ getList, batch }: Dependencies): List => {
  const list: List = async <P>(method: ListableMethod, params: ListParams = {}): Promise<ListPayload<P>> => {
    const start = params.start || 0
    const firstCall = await getList<P>(method, { ...params, start })

    // tslint:disable-next-line no-if-statement
    if (!firstCall.next) return firstCall

    const toProcess = firstCall.total - start
    const batchCommands = fillWithCommands({ method, params }, start, toProcess, MAX_ENTRIES_PER_COMMAND)

    return batch<Record<string | number, readonly P[]>>(batchCommands)
      // @todo Messy, made in hurry. Refactor this. Had some issues with types
      .then(({ result: { result, result_error }, time }) => {
        const flattenResult = isArray(result)
          ? result.reduce((res, r) => [...res, ...r], [] as readonly P[])
          : Object.values(result).reduce((res, r) => !res || !r ? [] : [...res, ...r], [] as readonly P[])

              // tslint:disable-next-line no-if-statement
        if (result_error.length && result_error.length > 0) {
          // tslint:disable-next-line no-throw
          throw new Error(
            `[batch] failed to process the batch. Received ${result_error.length} errors.`
          )
        }

        return {
          error: undefined,
          next: undefined,
          result: flattenResult ? flattenResult : [],
          // @todo Not accurate, we do not care
          time,
          total: firstCall.total
        }
      })
  }

  return list
}
