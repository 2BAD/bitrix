import { type Batch, createBatch } from './batch.js'
import { createLimiter, type LimiterOptions } from './limiter.js'
import type { Args, Item, Method, Params, Result } from './methods.js'
import { createPaginate, type Paginate, type PaginateOptions } from './paginate.js'
import { createCrmService, createProductRows } from './services/crm.js'
import { createProductsService } from './services/products.js'
import { createStatusesService } from './services/statuses.js'
import { createUsersService } from './services/users.js'
import { createTransport, type Envelope, type TransportOptions } from './transport.js'

export type ClientOptions = TransportOptions & {
  readonly limiter?: LimiterOptions
}

export type CallOptions = {
  readonly signal?: AbortSignal
}

export type Call = {
  <M extends Method>(
    method: M,
    params: Params<M>,
    options: CallOptions & { readonly raw: true }
  ): Promise<Envelope<Result<M>>>
  <M extends Method>(method: M, ...args: Args<M, CallOptions & { readonly raw?: false }>): Promise<Result<M>>
}

export type List = <M extends Method>(method: M, ...args: Args<M, PaginateOptions>) => Promise<Item<M>[]>

export type Core = {
  readonly call: Call
  readonly batch: Batch
  readonly paginate: Paginate
  readonly list: List
}

/**
 * Creates a Bitrix24 REST client
 * @example
 * const bitrix = createClient({ url: 'https://portal.bitrix24.com/rest/1/WEBHOOK_TOKEN' })
 * const deal = await bitrix.deals.get(77)
 */
export const createClient = (options: ClientOptions) => {
  const transport = createTransport(options, createLimiter(options.limiter))

  const call = (async (
    method: string,
    params?: Readonly<Record<string, unknown>>,
    { raw = false, signal }: CallOptions & { readonly raw?: boolean } = {}
  ) => {
    const envelope = await transport(method, params, signal)
    return raw ? envelope : envelope.result
  }) as Call

  const batch = createBatch(transport)
  const paginate = createPaginate(transport, batch)

  const list = (async (method: string, params?: Readonly<Record<string, unknown>>, listOptions?: PaginateOptions) => {
    const rows = []
    for await (const row of paginate(method, params, listOptions)) rows.push(row)
    return rows
  }) as List

  const core = { call, batch, paginate, list }

  return {
    ...core,
    activities: createCrmService(core, 'activity'),
    companies: createCrmService(core, 'company'),
    contacts: createCrmService(core, 'contact'),
    deals: { ...createCrmService(core, 'deal'), productRows: createProductRows(core, 'deal') },
    leads: { ...createCrmService(core, 'lead'), productRows: createProductRows(core, 'lead') },
    products: createProductsService(core),
    statuses: createStatusesService(core),
    users: createUsersService(core)
  }
}

export type Client = ReturnType<typeof createClient>
