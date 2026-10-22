import type { Core } from '../client.js'
import type { Product } from '../entities/catalog.js'
import type { Id, Input } from '../entities/crm.js'
import type { Params } from '../methods.js'
import type { PaginateOptions } from '../paginate.js'

type ProductListParams = Params<'catalog.product.list'>
type ProductPaginateOptions = Omit<PaginateOptions, 'idField'>

/**
 * `catalog.product.list` rejects requests that do not select `id` and `iblockId`
 * @param params list params from the caller
 */
const withRequiredSelect = (params: ProductListParams): ProductListParams => ({
  ...params,
  select: [...new Set([...(params.select ?? ['name']), 'id', 'iblockId'] as const)]
})

export const createProductsService = ({ call, list, paginate }: Core) => ({
  fields: async (iblockId: number) =>
    (await call('catalog.product.getFieldsByFilter', { filter: { iblockId } })).product,
  get: async (id: Id) => (await call('catalog.product.get', { id })).product,
  list: (params: ProductListParams, options: ProductPaginateOptions = {}) =>
    list('catalog.product.list', withRequiredSelect(params), { ...options, idField: 'id' }),
  paginate: (params: ProductListParams, options: ProductPaginateOptions = {}) =>
    paginate('catalog.product.list', withRequiredSelect(params), { ...options, idField: 'id' }),
  create: async (fields: Params<'catalog.product.add'>['fields']) =>
    (await call('catalog.product.add', { fields })).element,
  update: async (id: Id, fields: Input<Product>) => (await call('catalog.product.update', { id, fields })).element,
  delete: (id: Id) => call('catalog.product.delete', { id })
})
