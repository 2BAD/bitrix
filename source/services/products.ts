import type { Core } from '../client.js'
import type { Product } from '../entities/catalog.js'
import type { Id, Input } from '../entities/crm.js'
import type { Params } from '../methods.js'
import type { PaginateOptions } from '../paginate.js'

type ProductField = keyof Product & string
type ProductListParams<S extends readonly ProductField[]> = Omit<Params<'catalog.product.list'>, 'select'> & {
  readonly select?: S
}
type ProductPaginateOptions = Pick<PaginateOptions, 'signal' | 'onProgress'> & { readonly mode?: 'cursor' | 'offset' }
type Picked<S extends readonly ProductField[]> = Pick<Product, S[number] | 'id' | 'iblockId'>

/**
 * `catalog.product.list` rejects requests that do not select `id` and `iblockId`
 * @param params list params from the caller
 */
const withRequiredSelect = (params: ProductListParams<readonly ProductField[]>) => ({
  ...params,
  select: [...new Set([...(params.select ?? ['name']), 'id', 'iblockId'] as const)]
})

export const createProductsService = ({ call, list, paginate }: Core) => ({
  fields: async (iblockId: number) =>
    (await call('catalog.product.getFieldsByFilter', { filter: { iblockId } })).product,
  get: async (id: Id) => (await call('catalog.product.get', { id })).product,
  list: <const S extends readonly ProductField[] = readonly ['name']>(
    params: ProductListParams<S>,
    options: ProductPaginateOptions = {}
  ) => list('catalog.product.list', withRequiredSelect(params), { ...options, idField: 'id' }) as Promise<Picked<S>[]>,
  paginate: <const S extends readonly ProductField[] = readonly ['name']>(
    params: ProductListParams<S>,
    options: ProductPaginateOptions = {}
  ) =>
    paginate('catalog.product.list', withRequiredSelect(params), { ...options, idField: 'id' }) as AsyncGenerator<
      Picked<S>,
      void,
      undefined
    >,
  create: async (fields: Params<'catalog.product.add'>['fields']) =>
    (await call('catalog.product.add', { fields })).element,
  update: async (id: Id, fields: Input<Product>) => (await call('catalog.product.update', { id, fields })).element,
  delete: (id: Id) => call('catalog.product.delete', { id })
})
