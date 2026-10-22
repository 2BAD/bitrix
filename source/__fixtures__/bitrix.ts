import { vi } from 'vitest'

export const TIME = {
  start: 1,
  finish: 2,
  duration: 1,
  processing: 1,
  date_start: '2026-01-01T00:00:00+03:00',
  date_finish: '2026-01-01T00:00:01+03:00',
  operating: 0,
  operating_reset_at: 1_000_000
}

export type Reply = { readonly status?: number; readonly body: unknown }
export type Handler = (method: string, body: any) => Reply | Promise<Reply>
export type Request = { readonly method: string; readonly body: any; readonly init: RequestInit }

export const ok = (result: unknown, extra: Record<string, unknown> = {}): Reply => ({
  body: { result, time: TIME, ...extra }
})

export const fail = (status: number, error: string, description = ''): Reply => ({
  status,
  body: { error, error_description: description }
})

/**
 * A `fetch` replacement that records requests and answers through `handler`
 * @param handler builds the reply for a method and its JSON body
 */
export const fakeFetch = (handler: Handler) => {
  const requests: Request[] = []
  const fetch = vi.fn<typeof globalThis.fetch>(async (input, init = {}) => {
    const method = new URL(String(input)).pathname.split('/').at(-1) as string
    const body = JSON.parse(String(init.body))
    requests.push({ method, body, init })
    const reply = await handler(method, body)
    return new Response(typeof reply.body === 'string' ? reply.body : JSON.stringify(reply.body), {
      status: reply.status ?? 200
    })
  })
  return { fetch, requests }
}

const decode = (query: string): any => {
  const params: any = {}
  for (const pair of query.split('&').filter(Boolean)) {
    const [rawKey = '', rawValue = ''] = pair.split('=')
    const [head = '', ...path] = decodeURIComponent(rawKey)
      .split(/[[\]]+/)
      .filter((part) => part !== '')
    let target = params
    for (const segment of [head, ...path].slice(0, -1)) target = target[segment] ??= {}
    target[[head, ...path].at(-1) as string] = decodeURIComponent(rawValue)
  }
  return params
}

const resolveReference = (value: unknown, results: Record<string, unknown>): unknown => {
  if (typeof value !== 'string' || !value.startsWith('$result')) return value
  const path = value
    .slice('$result'.length)
    .split(/[[\]]+/)
    .filter((part) => part !== '')
  return path.reduce<any>((node, segment) => node?.[segment], results)
}

type ListOptions = {
  readonly count: number
  readonly idField?: string
  readonly wrap?: string
}

/**
 * Simulates a Bitrix list method plus `batch`, including how Bitrix drops a filter whose `$result` reference is missing
 * @param options size and shape of the simulated list
 * @param options.count number of rows
 * @param options.idField name of the id field, `ID` by default
 * @param options.wrap key that wraps rows in catalog style results
 */
export const fakeList = ({ count, idField = 'ID', wrap }: ListOptions) => {
  const rows = Array.from({ length: count }, (_, index) => ({ [idField]: String((index + 1) * 2) }))

  const list = (params: any) => {
    const after = params.filter?.[`>${idField}`]
    const matching = after === undefined ? rows : rows.filter((row) => Number(row[idField]) > Number(after))
    const start = Number(params.start ?? 0)
    const page = matching.slice(Math.max(start, 0), Math.max(start, 0) + 50)
    const result = wrap ? { [wrap]: page } : page
    if (start === -1) return { result, total: 0 }
    const next = start + 50 < matching.length ? start + 50 : undefined
    return { result, total: matching.length, ...(next !== undefined && { next }) }
  }

  const handler: Handler = (method, body) => {
    if (method !== 'batch') return { body: { ...list(body), time: TIME } }

    const results: Record<string, unknown> = {}
    const totals: Record<string, unknown> = {}
    for (const [key, command] of Object.entries<string>(body.cmd)) {
      const [, query = ''] = command.split('?')
      const params = decode(query)
      params.filter = Object.fromEntries(
        Object.entries(params.filter ?? {})
          .map(([field, value]) => [field, resolveReference(value, results)])
          .filter(([, value]) => value !== undefined)
      )
      const { result, total } = list(params)
      results[key] = result
      totals[key] = total
    }
    return ok({ result: results, result_error: [], result_total: totals, result_next: [], result_time: [] })
  }

  return { rows, handler }
}
