import { type Batch, MAX_COMMANDS_PER_BATCH } from './batch.js'
import type { Args, Item, Method } from './methods.js'
import type { Transport } from './transport.js'

export const PAGE_SIZE = 50

export type PaginateOptions = {
  /**
   * `cursor` (default) walks the list by ascending id, which stays fast and consistent on large portals.
   * `offset` uses `start` and allows any `order`
   */
  readonly mode?: 'cursor' | 'offset'
  /** Id field used by `cursor` mode: `ID` for CRM methods, `id` for catalog style methods */
  readonly idField?: string
  readonly signal?: AbortSignal
}

export type Paginate = <M extends Method>(
  method: M,
  ...args: Args<M, PaginateOptions>
) => AsyncGenerator<Item<M>, void, undefined>

type Row = Readonly<Record<string, unknown>>
type ListParams = {
  readonly select?: readonly string[]
  readonly filter?: Readonly<Record<string, unknown>>
  readonly order?: Readonly<Record<string, unknown>>
  readonly start?: number
}

/**
 * Finds the rows in a list result: either the result itself or the single array a catalog style result wraps
 * @param method method name used in the error message
 * @param result result of a list method
 */
const unwrap = (method: string, result: unknown): { rows: readonly Row[]; key: string | undefined } => {
  if (Array.isArray(result)) return { rows: result, key: undefined }
  const entries = typeof result === 'object' && result !== null ? Object.entries(result) : []
  const [entry] = entries
  if (entries.length === 1 && entry && Array.isArray(entry[1])) return { rows: entry[1], key: entry[0] }
  throw new TypeError(`${method} did not return a list`)
}

/**
 * Batches start with one page and double up to 50, so a consumer that stops early wastes few requests
 * @param size pages in the previous batch
 */
const grow = (size: number) => Math.min(size * 2, MAX_COMMANDS_PER_BATCH)

export const createPaginate = (transport: Transport, batch: Batch): Paginate => {
  const runBatch = async function* (
    method: string,
    pages: ReadonlyArray<Readonly<Record<string, unknown>>>,
    signal: AbortSignal | undefined,
    resumable: boolean
  ): AsyncGenerator<readonly Row[], void, undefined> {
    const { results, errors } = await batch(
      pages.map((params) => ({ method, params })),
      signal && { signal }
    )
    for (const [index, error] of errors.entries()) {
      // Chained pages are not retried by `batch`, the cursor resumes from the last page it got instead
      if (error && resumable && index > 0 && error.code === 'OPERATION_TIME_LIMIT') return
      if (error) throw error
      yield unwrap(method, results[index]).rows
    }
  }

  const cursor = async function* (method: string, params: ListParams, idField: string, signal?: AbortSignal) {
    if (Object.keys(params.order ?? {}).some((field) => field !== idField)) {
      throw new TypeError(`cursor pagination orders by ${idField}, use { mode: 'offset' } for a custom order`)
    }
    const { start: _start, ...rest } = params
    const select =
      rest.select && !rest.select.includes('*') && !rest.select.includes(idField)
        ? [...rest.select, idField]
        : rest.select
    const page = (filter: Readonly<Record<string, unknown>>) => ({
      ...rest,
      ...(select && { select }),
      filter: { ...rest.filter, ...filter },
      order: { [idField]: 'ASC' },
      start: -1
    })

    const first = await transport(method, page({}), signal)
    let { rows, key } = unwrap(method, first.result)
    yield* rows

    for (let size = 1; rows.length === PAGE_SIZE; size = grow(size)) {
      const lastId = (rows.at(-1) as Row)[idField]
      const pages = Array.from({ length: size }, (_, index) =>
        page({
          [`>${idField}`]:
            index === 0 ? lastId : `$result[${index - 1}]${key ? `[${key}]` : ''}[${PAGE_SIZE - 1}][${idField}]`
        })
      )
      for await (rows of runBatch(method, pages, signal, true)) {
        yield* rows
        // A short page ends the list. Bitrix drops a filter whose reference is missing, so later pages are invalid
        if (rows.length < PAGE_SIZE) return
      }
    }
  }

  const offset = async function* (method: string, params: ListParams, signal?: AbortSignal) {
    const first = await transport(method, { ...params, start: params.start ?? 0 }, signal)
    yield* unwrap(method, first.result).rows
    if (first.next === undefined) return

    const starts = []
    for (let start = first.next; start < (first.total ?? 0); start += PAGE_SIZE) starts.push(start)
    for (let index = 0, size = 1; index < starts.length; index += size, size = grow(size)) {
      const pages = starts.slice(index, index + size).map((start) => ({ ...params, start }))
      for await (const rows of runBatch(method, pages, signal, false)) yield* rows
    }
  }

  return async function* (method: string, params: ListParams = {}, options: PaginateOptions = {}) {
    const { mode = 'cursor', idField = 'ID', signal } = options
    yield* mode === 'cursor' ? cursor(method, params, idField, signal) : offset(method, params, signal)
  } as Paginate
}
