import { type Batch, createBatch } from './batch.js'
import { createLimiter, type LimiterOptions } from './limiter.js'
import type { Args, Item, Method, Params, Result } from './methods.js'
import { createPaginate, type Paginate, type PaginateOptions } from './paginate.js'
import { createCrmService, createLinks, createProductRows } from './services/crm.js'
import { createCurrenciesService } from './services/currencies.js'
import { createItemsService } from './services/items.js'
import { createProductsService } from './services/products.js'
import { createStatusesService } from './services/statuses.js'
import { createUsersService } from './services/users.js'
import { createTransport, type Envelope, type RetryOptions, type TransportOptions } from './transport.js'

export type ClientOptions = TransportOptions & {
  readonly limiter?: LimiterOptions
  readonly retry?: RetryOptions
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
 * @param options endpoint, auth, limiter and retry settings
 * @example
 * const bitrix = createClient({ url: 'https://portal.bitrix24.com/rest/1/WEBHOOK_TOKEN' })
 * const deal = await bitrix.deals.get(77)
 */
export const createClient = (options: ClientOptions) => {
  const retry = { retries: 3, delay: 1000, ...options.retry }
  const transport = createTransport(options, createLimiter(options.limiter), retry)

  const call = (async (
    method: string,
    params?: Readonly<Record<string, unknown>>,
    { raw = false, signal }: CallOptions & { readonly raw?: boolean } = {}
  ) => {
    const envelope = await transport(method, params, signal)
    return raw ? envelope : envelope.result
  }) as Call

  const batch = createBatch(transport, retry)
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
    companies: { ...createCrmService(core, 'company'), contacts: createLinks(core, 'company', 'contact') },
    contacts: { ...createCrmService(core, 'contact'), companies: createLinks(core, 'contact', 'company') },
    currencies: createCurrenciesService(core),
    deals: {
      ...createCrmService(core, 'deal'),
      productRows: createProductRows(core, 'deal'),
      contacts: createLinks(core, 'deal', 'contact')
    },
    items: (entityTypeId: number) => createItemsService(core, entityTypeId),
    leads: {
      ...createCrmService(core, 'lead'),
      productRows: createProductRows(core, 'lead'),
      contacts: createLinks(core, 'lead', 'contact')
    },
    products: createProductsService(core),
    statuses: createStatusesService(core),
    users: createUsersService(core)
  }
}

export type Client = ReturnType<typeof createClient>
