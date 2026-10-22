import type { Core } from '../client.js'
import type {
  Activity,
  BoolString,
  Company,
  Contact,
  Deal,
  Fields,
  Id,
  Input,
  Lead,
  ProductRow
} from '../entities/crm.js'
import type { ListParams } from '../methods.js'
import type { PaginateOptions } from '../paginate.js'

type Entities = {
  readonly activity: Activity
  readonly company: Company
  readonly contact: Contact
  readonly deal: Deal
  readonly lead: Lead
}

type SonetParams = { readonly REGISTER_SONET_EVENT?: BoolString }

export type CrmService<E> = {
  readonly fields: () => Promise<Fields>
  readonly get: (id: Id) => Promise<E>
  readonly list: (params?: ListParams<E>, options?: PaginateOptions) => Promise<E[]>
  readonly paginate: (params?: ListParams<E>, options?: PaginateOptions) => AsyncGenerator<E, void, undefined>
  readonly create: (fields: Input<E>, params?: SonetParams) => Promise<number>
  readonly update: (id: Id, fields: Input<E>, params?: SonetParams) => Promise<boolean>
  readonly delete: (id: Id) => Promise<boolean>
}

type Untyped = Readonly<Record<string, unknown>>

/**
 * CRM entities share one set of `crm.<entity>.*` methods, so their services only differ by name
 * @param core client methods the service is built on
 * @param core.call calls a single REST method
 * @param core.list reads every page of a list method
 * @param core.paginate iterates over every page of a list method
 * @param name entity name in the method names, like `deal` in `crm.deal.get`
 */
export const createCrmService = <N extends keyof Entities>(
  { call, list, paginate }: Core,
  name: N
): CrmService<Entities[N]> => {
  const send = call as (method: string, params?: Untyped) => Promise<never>
  const method = `crm.${name}`

  return {
    fields: () => send(`${method}.fields`),
    get: (id) => send(`${method}.get`, { id }),
    list: (params, options) => list(`${method}.list`, params as Untyped, options) as Promise<never>,
    paginate: (params, options) => paginate(`${method}.list`, params as Untyped, options) as AsyncGenerator<never>,
    create: (fields, params) => send(`${method}.add`, { fields, ...(params && { params }) }),
    update: (id, fields, params) => send(`${method}.update`, { id, fields, ...(params && { params }) }),
    delete: (id) => send(`${method}.delete`, { id })
  }
}

export const createProductRows = ({ call }: Core, name: 'deal' | 'lead') => ({
  get: (id: Id): Promise<ProductRow[]> => call(`crm.${name}.productrows.get`, { id }),
  set: (id: Id, rows: ReadonlyArray<Input<ProductRow>>): Promise<boolean> =>
    call(`crm.${name}.productrows.set`, { id, rows })
})
