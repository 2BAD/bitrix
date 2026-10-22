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
  Link,
  LinkInput,
  ProductRow
} from '../entities/crm.js'
import type { BitrixError } from '../errors.js'
import type { ListParams, Selected, SelectField } from '../methods.js'
import type { PaginateOptions } from '../paginate.js'

type Entities = {
  readonly activity: Activity
  readonly company: Company
  readonly contact: Contact
  readonly deal: Deal
  readonly lead: Lead
}

type SonetParams = { readonly REGISTER_SONET_EVENT?: BoolString }

/**
 * Outcome of a bulk write, one entry per input item in the same order
 */
export type BulkResult<R> = {
  readonly results: Array<R | undefined>
  readonly errors: Array<BitrixError | undefined>
}

export type CrmService<E> = {
  readonly fields: () => Promise<Fields>
  readonly get: (id: Id) => Promise<E>
  readonly list: <const S extends readonly SelectField<E>[] = []>(
    params?: ListParams<E, S>,
    options?: PaginateOptions
  ) => Promise<Selected<E, S>[]>
  readonly paginate: <const S extends readonly SelectField<E>[] = []>(
    params?: ListParams<E, S>,
    options?: PaginateOptions
  ) => AsyncGenerator<Selected<E, S>, void, undefined>
  /** Rows changed at or after `since`, oldest change first */
  readonly changedSince: <const S extends readonly SelectField<E>[] = []>(
    since: Date | string,
    params?: ListParams<E, S>,
    options?: Pick<PaginateOptions, 'signal' | 'onProgress'>
  ) => AsyncGenerator<Selected<E, S>, void, undefined>
  readonly create: (fields: Input<E>, params?: SonetParams) => Promise<number>
  readonly update: (id: Id, fields: Input<E>, params?: SonetParams) => Promise<boolean>
  readonly delete: (id: Id) => Promise<boolean>
  readonly createMany: (items: ReadonlyArray<Input<E>>, params?: SonetParams) => Promise<BulkResult<number>>
  readonly updateMany: (
    items: ReadonlyArray<{ readonly id: Id; readonly fields: Input<E> }>,
    params?: SonetParams
  ) => Promise<BulkResult<boolean>>
  readonly deleteMany: (ids: readonly Id[]) => Promise<BulkResult<boolean>>
}

type Untyped = Readonly<Record<string, unknown>>

/**
 * CRM entities share one set of `crm.<entity>.*` methods, so their services only differ by name
 * @param core client methods the service is built on
 * @param core.call calls a single REST method
 * @param core.batch runs many commands in as few requests as possible
 * @param core.list reads every page of a list method
 * @param core.paginate iterates over every page of a list method
 * @param name entity name in the method names, like `deal` in `crm.deal.get`
 */
export const createCrmService = <N extends keyof Entities>(
  { call, batch, list, paginate }: Core,
  name: N
): CrmService<Entities[N]> => {
  const send = call as (method: string, params?: Untyped) => Promise<never>
  const sendMany = batch as (commands: ReadonlyArray<{ method: string; params: Untyped }>) => Promise<never>
  const method = `crm.${name}`
  const modifiedField = name === 'activity' ? 'LAST_UPDATED' : 'DATE_MODIFY'

  return {
    fields: () => send(`${method}.fields`),
    get: (id) => send(`${method}.get`, { id }),
    list: (params, options) => list(`${method}.list`, params as Untyped, options) as Promise<never>,
    paginate: (params, options) => paginate(`${method}.list`, params as Untyped, options) as AsyncGenerator<never>,
    changedSince: (since, params, options) =>
      paginate(`${method}.list`, params as Untyped, {
        ...options,
        mode: 'modified',
        since,
        modifiedField
      }) as AsyncGenerator<never>,
    create: (fields, params) => send(`${method}.add`, { fields, ...(params && { params }) }),
    update: (id, fields, params) => send(`${method}.update`, { id, fields, ...(params && { params }) }),
    delete: (id) => send(`${method}.delete`, { id }),
    createMany: (items, params) =>
      sendMany(items.map((fields) => ({ method: `${method}.add`, params: { fields, ...(params && { params }) } }))),
    updateMany: (items, params) =>
      sendMany(
        items.map(({ id, fields }) => ({
          method: `${method}.update`,
          params: { id, fields, ...(params && { params }) }
        }))
      ),
    deleteMany: (ids) => sendMany(ids.map((id) => ({ method: `${method}.delete`, params: { id } })))
  }
}

export type ProductRows = {
  readonly get: (id: Id) => Promise<ProductRow[]>
  readonly set: (id: Id, rows: ReadonlyArray<Input<ProductRow>>) => Promise<boolean>
}

/**
 * Product rows of a deal or lead
 * @param core client methods the service is built on
 * @param core.call calls a single REST method
 * @param name entity name in the method names
 */
export const createProductRows = ({ call }: Core, name: 'deal' | 'lead'): ProductRows => ({
  get: (id) => call(`crm.${name}.productrows.get`, { id }),
  set: (id, rows) => call(`crm.${name}.productrows.set`, { id, rows })
})

export type Links<K extends string> = {
  readonly get: (id: Id) => Promise<Link<K>[]>
  /** Replaces every link, the first one becomes primary unless another sets `IS_PRIMARY` */
  readonly set: (id: Id, links: ReadonlyArray<LinkInput<K>>) => Promise<boolean>
  readonly add: (id: Id, link: LinkInput<K>) => Promise<boolean>
  /** Resolves with `false` when the entities were not linked */
  readonly delete: (id: Id, linkedId: Id) => Promise<boolean>
  readonly clear: (id: Id) => Promise<boolean>
}

/**
 * Links between CRM entities through `crm.<owner>.<linked>.*`, like the contacts of a deal
 * @param core client methods the service is built on
 * @param core.call calls a single REST method
 * @param owner entity the links belong to
 * @param linked entity that is linked
 */
export const createLinks = <L extends 'contact' | 'company'>(
  { call }: Core,
  owner: 'deal' | 'lead' | 'company' | 'contact',
  linked: L
): Links<`${Uppercase<L>}_ID`> => {
  const send = call as (method: string, params: Untyped) => Promise<never>
  const method = `crm.${owner}.${linked}`
  const key = `${linked.toUpperCase()}_ID`
  return {
    get: (id) => send(`${method}.items.get`, { id }),
    set: (id, links) => send(`${method}.items.set`, { id, items: links }),
    add: (id, link) => send(`${method}.add`, { id, fields: link }),
    delete: (id, linkedId) => send(`${method}.delete`, { id, fields: { [key]: linkedId } }),
    clear: (id) => send(`${method}.items.delete`, { id })
  }
}
