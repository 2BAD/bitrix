import type { Core } from '../client.js'
import type { Id, Input, CrmItem } from '../entities/crm.js'
import type { Params } from '../methods.js'
import type { PaginateOptions } from '../paginate.js'

type ItemSelect = NonNullable<Params<'crm.item.list'>['select']>
type ItemListParams<S extends ItemSelect> = Omit<Params<'crm.item.list'>, 'entityTypeId' | 'select'> & {
  readonly select?: S
}
type ItemPaginateOptions = Pick<PaginateOptions, 'signal' | 'onProgress'> & { readonly mode?: 'cursor' | 'offset' }
type Picked<S extends ItemSelect> = S extends readonly []
  ? CrmItem
  : '*' extends S[number]
    ? CrmItem
    : Pick<CrmItem, S[number] & keyof CrmItem>

/**
 * `crm.item.*` works for every CRM type by its `entityTypeId`, smart processes included, and wraps its results
 * in `item`, `items` or `fields`
 * @param core client methods the service is built on
 * @param core.call calls a single REST method
 * @param core.list reads every page of a list method
 * @param core.paginate iterates over every page of a list method
 * @param entityTypeId type id, like 2 for deals or the id of a smart process from `crm.type.list`
 */
export const createItemsService = ({ call, list, paginate }: Core, entityTypeId: number) => ({
  fields: async () => (await call('crm.item.fields', { entityTypeId })).fields,
  get: async (id: Id) => (await call('crm.item.get', { entityTypeId, id })).item,
  list: <const S extends ItemSelect = []>(params: ItemListParams<S> = {}, options: ItemPaginateOptions = {}) =>
    list('crm.item.list', { ...params, entityTypeId }, { ...options, idField: 'id' }) as Promise<Picked<S>[]>,
  paginate: <const S extends ItemSelect = []>(params: ItemListParams<S> = {}, options: ItemPaginateOptions = {}) =>
    paginate('crm.item.list', { ...params, entityTypeId }, { ...options, idField: 'id' }) as AsyncGenerator<
      Picked<S>,
      void,
      undefined
    >,
  changedSince: <const S extends ItemSelect = []>(
    since: Date | string,
    params: ItemListParams<S> = {},
    options: Pick<PaginateOptions, 'signal' | 'onProgress'> = {}
  ) =>
    paginate(
      'crm.item.list',
      { ...params, entityTypeId },
      { ...options, mode: 'modified', since, idField: 'id', modifiedField: 'updatedTime' }
    ) as AsyncGenerator<Picked<S>, void, undefined>,
  create: async (fields: Input<CrmItem>) => (await call('crm.item.add', { entityTypeId, fields })).item,
  update: async (id: Id, fields: Input<CrmItem>) => (await call('crm.item.update', { entityTypeId, id, fields })).item,
  delete: async (id: Id) => {
    await call('crm.item.delete', { entityTypeId, id })
  }
})
