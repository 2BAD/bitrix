import { type Batch, MAX_COMMANDS_PER_BATCH } from './batch.js'
import type { Args, Item, Method } from './methods.js'
import type { Transport } from './transport.js'

export const PAGE_SIZE = 50

export type PaginateProgress = {
  /** Rows read so far */
  readonly read: number
  /** Rows matching the list when the read started, so it can drift when rows change during the read */
  readonly total?: number
}

type CommonOptions = {
  /** Id field: `ID` for CRM methods, `id` for catalog style methods */
  readonly idField?: string
  readonly signal?: AbortSignal
  /**
   * Called after every page. In `cursor` and `modified` modes setting it makes the first request count the rows,
   * which Bitrix skips otherwise, so it costs one slower request on large lists
   */
  readonly onProgress?: (progress: PaginateProgress) => void
}

export type PaginateOptions = CommonOptions &
  (
    | {
        /**
         * `cursor` (default) walks the list by ascending id, which stays fast and consistent on large portals.
         * `offset` uses `start` and allows any `order`
         */
        readonly mode?: 'cursor' | 'offset'
      }
    | {
        /**
         * `modified` walks the rows changed at or after `since`, in the order they changed. A row that changes
         * again during the read is returned again
         */
        readonly mode: 'modified'
        readonly since: Date | string
        /** Modification time field: `DATE_MODIFY` by default, `LAST_UPDATED` for activities */
        readonly modifiedField?: string
      }
  )

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
type Page = { readonly rows: readonly Row[]; readonly total?: number | undefined }

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

/**
 * Adds the fields pagination relies on to an explicit select. Wildcards and no select already include them
 * @param select select of the caller
 * @param fields fields to add
 */
const withFields = (select: readonly string[] | undefined, fields: readonly string[]) =>
  select && !select.includes('*') ? [...new Set([...select, ...fields])] : select

export const createPaginate = (transport: Transport, batch: Batch): Paginate => {
  const runBatch = async function* (
    method: string,
    pages: ReadonlyArray<Readonly<Record<string, unknown>>>,
    signal: AbortSignal | undefined,
    resumable: boolean
  ): AsyncGenerator<Page, void, undefined> {
    const { results, errors } = await batch(
      pages.map((params) => ({ method, params })),
      signal && { signal }
    )
    for (const [index, error] of errors.entries()) {
      // Chained pages are not retried by `batch`, the cursor resumes from the last page it got instead
      if (error && resumable && index > 0 && error.code === 'OPERATION_TIME_LIMIT') return
      if (error) throw error
      yield { rows: unwrap(method, results[index]).rows }
    }
  }

  const cursor = async function* (
    method: string,
    params: ListParams,
    idField: string,
    count: boolean,
    signal?: AbortSignal
  ): AsyncGenerator<Page, void, undefined> {
    if (Object.keys(params.order ?? {}).some((field) => field !== idField)) {
      throw new TypeError(`cursor pagination orders by ${idField}, use { mode: 'offset' } for a custom order`)
    }
    const { start: _start, ...rest } = params
    const select = withFields(rest.select, [idField])
    const page = (filter: Readonly<Record<string, unknown>>) => ({
      ...rest,
      ...(select && { select }),
      filter: { ...rest.filter, ...filter },
      order: { [idField]: 'ASC' },
      start: -1
    })

    const { start: _counted, ...counted } = page({})
    const first = await transport(method, count ? counted : page({}), signal)
    let { rows, key } = unwrap(method, first.result)
    yield { rows, total: count ? first.total : undefined }

    for (let size = 1; rows.length === PAGE_SIZE; size = grow(size)) {
      const lastId = (rows.at(-1) as Row)[idField]
      const pages = Array.from({ length: size }, (_, index) =>
        page({
          [`>${idField}`]:
            index === 0 ? lastId : `$result[${index - 1}]${key ? `[${key}]` : ''}[${PAGE_SIZE - 1}][${idField}]`
        })
      )
      for await ({ rows } of runBatch(method, pages, signal, true)) {
        yield { rows }
        // A short page ends the list. Bitrix drops a filter whose reference is missing, so later pages are invalid
        if (rows.length < PAGE_SIZE) return
      }
    }
  }

  const modified = async function* (
    method: string,
    params: ListParams,
    idField: string,
    modifiedField: string,
    since: Date | string,
    count: boolean,
    signal?: AbortSignal
  ): AsyncGenerator<Page, void, undefined> {
    if (Object.keys(params.order ?? {}).some((field) => field !== modifiedField && field !== idField)) {
      throw new TypeError(`modified pagination orders by ${modifiedField} and ${idField}`)
    }
    const { start: _start, order: _order, ...rest } = params
    const select = withFields(rest.select, [idField, modifiedField])
    let after: Readonly<Record<string, unknown>> = {
      [`>=${modifiedField}`]: since instanceof Date ? since.toISOString() : since
    }

    for (let counting = count; ; counting = false) {
      const page = await transport(
        method,
        {
          ...rest,
          ...(select && { select }),
          filter: { ...rest.filter, ...after },
          order: { [modifiedField]: 'ASC', [idField]: 'ASC' },
          ...(!counting && { start: -1 })
        },
        signal
      )
      const { rows } = unwrap(method, page.result)
      yield { rows, total: counting ? page.total : undefined }
      if (rows.length < PAGE_SIZE) return

      // Rows sharing the last modification time can continue past this page, read those by id before moving on
      const last = rows.at(-1) as Row
      yield* cursor(
        method,
        {
          ...rest,
          ...(select && { select }),
          filter: { ...rest.filter, [`=${modifiedField}`]: last[modifiedField], [`>${idField}`]: last[idField] }
        },
        idField,
        false,
        signal
      )
      after = { [`>${modifiedField}`]: last[modifiedField] }
    }
  }

  const offset = async function* (
    method: string,
    params: ListParams,
    signal?: AbortSignal
  ): AsyncGenerator<Page, void, undefined> {
    const first = await transport(method, { ...params, start: params.start ?? 0 }, signal)
    yield { rows: unwrap(method, first.result).rows, total: first.total }
    if (first.next === undefined) return

    const starts = []
    for (let start = first.next; start < (first.total ?? 0); start += PAGE_SIZE) starts.push(start)
    for (let index = 0, size = 1; index < starts.length; index += size, size = grow(size)) {
      const pages = starts.slice(index, index + size).map((start) => ({ ...params, start }))
      yield* runBatch(method, pages, signal, false)
    }
  }

  const pages = (method: string, params: ListParams, options: PaginateOptions) => {
    const { idField = 'ID', signal, onProgress } = options
    const count = onProgress !== undefined
    if (options.mode === 'modified') {
      return modified(method, params, idField, options.modifiedField ?? 'DATE_MODIFY', options.since, count, signal)
    }
    return options.mode === 'offset' ? offset(method, params, signal) : cursor(method, params, idField, count, signal)
  }

  return async function* (method: string, params: ListParams = {}, options: PaginateOptions = {}) {
    let read = 0
    let total: number | undefined
    for await (const page of pages(method, params, options)) {
      read += page.rows.length
      total ??= page.total
      options.onProgress?.({ read, ...(total !== undefined && { total }) })
      yield* page.rows
    }
  } as Paginate
}
