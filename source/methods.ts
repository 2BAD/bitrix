import type { Product, ProductField } from './entities/catalog.js'
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
  ProductRow,
  Status
} from './entities/crm.js'
import type { User } from './entities/user.js'

type Empty = Readonly<Record<string, never>>

export type FilterValue = string | number | boolean | null | ReadonlyArray<string | number>
export type Filter = Readonly<Record<string, FilterValue>>
export type Order = 'ASC' | 'DESC' | 'asc' | 'desc'

type MultiFields = 'PHONE' | 'EMAIL' | 'WEB' | 'IM' | 'LINK'

export type SelectField<E> = (keyof E & string) | '*' | 'UF_*' | MultiFields

export type ListParams<E, S extends readonly SelectField<E>[] = readonly SelectField<E>[]> = {
  readonly select?: S
  readonly filter?: Filter
  readonly order?: { readonly [K in keyof E & string]?: Order }
  readonly start?: number
}

type Standard<E> = Omit<E, `UF_${string}` | MultiFields>
type Nothing = Record<never, never>
type Flatten<T> = { [K in keyof T]: T[K] }

/**
 * Row type of a CRM list for a given `select`: `*` and no select give the standard fields, `UF_*` adds
 * user fields, named fields are picked as they are
 */
export type Selected<E, S extends readonly string[]> = Flatten<
  S extends readonly []
    ? Standard<E>
    : ('*' extends S[number] ? Standard<E> : Nothing) &
        ('UF_*' extends S[number] ? Pick<E, keyof E & `UF_${string}`> : Nothing) &
        Pick<E, S[number] & keyof E>
>

type SonetParams = { readonly params?: { readonly REGISTER_SONET_EVENT?: BoolString } }

type CrmMethods<Name extends string, E> = Record<`crm.${Name}.fields`, { params: Empty; result: Fields }> &
  Record<`crm.${Name}.get`, { params: { readonly id: Id }; result: E }> &
  Record<`crm.${Name}.list`, { params: ListParams<E>; result: E[] }> &
  Record<`crm.${Name}.add`, { params: { readonly fields: Input<E> } & SonetParams; result: number }> &
  Record<
    `crm.${Name}.update`,
    { params: { readonly id: Id; readonly fields: Input<E> } & SonetParams; result: boolean }
  > &
  Record<`crm.${Name}.delete`, { params: { readonly id: Id }; result: boolean }>

type ProductRowMethods<Name extends string> = Record<
  `crm.${Name}.productrows.get`,
  { params: { readonly id: Id }; result: ProductRow[] }
> &
  Record<
    `crm.${Name}.productrows.set`,
    { params: { readonly id: Id; readonly rows: ReadonlyArray<Input<ProductRow>> }; result: boolean }
  >

type ProductFilter = Filter & { readonly iblockId: number }
type ProductInput = Input<Product> & { readonly iblockId: number; readonly name: string }

/**
 * Registry of typed REST methods. Augment it to type methods the client does not cover:
 * ```ts
 * declare module '@2bad/bitrix' {
 *   interface Methods {
 *     'tasks.task.get': { params: { taskId: number }; result: { task: Task } }
 *   }
 * }
 * ```
 */
export interface Methods
  extends
    CrmMethods<'deal', Deal>,
    CrmMethods<'lead', Lead>,
    CrmMethods<'contact', Contact>,
    CrmMethods<'company', Company>,
    CrmMethods<'activity', Activity>,
    ProductRowMethods<'deal'>,
    ProductRowMethods<'lead'> {
  'crm.status.fields': { params: Empty; result: Fields }
  'crm.status.get': { params: { readonly id: Id }; result: Status }
  'crm.status.list': {
    params: Pick<ListParams<Status>, 'filter' | 'order'>
    result: Status[]
  }
  'crm.status.add': { params: { readonly fields: Input<Status> }; result: number }
  'crm.status.update': { params: { readonly id: Id; readonly fields: Input<Status> }; result: boolean }
  'crm.status.delete': {
    params: { readonly id: Id; readonly params?: { readonly FORCED?: BoolString } }
    result: boolean
  }

  'user.fields': { params: Empty; result: Record<string, string> }
  'user.current': { params: Empty; result: User }
  'user.get': {
    params: {
      readonly ID?: Id
      readonly filter?: Filter
      readonly sort?: keyof User & string
      readonly order?: Order
      readonly start?: number
      readonly ADMIN_MODE?: boolean
    }
    result: User[]
  }

  'catalog.product.getFieldsByFilter': {
    params: { readonly filter: ProductFilter }
    result: { product: Record<string, ProductField> }
  }
  'catalog.product.get': { params: { readonly id: Id }; result: { product: Product } }
  'catalog.product.list': {
    params: {
      readonly select?: ReadonlyArray<keyof Product & string>
      readonly filter: ProductFilter
      readonly order?: { readonly [K in keyof Product & string]?: Order }
      readonly start?: number
    }
    result: { products: Product[] }
  }
  'catalog.product.add': { params: { readonly fields: ProductInput }; result: { element: Product } }
  'catalog.product.update': {
    params: { readonly id: Id; readonly fields: Input<Product> }
    result: { element: Product }
  }
  'catalog.product.delete': { params: { readonly id: Id }; result: boolean }
}

/**
 * Any method name. Known ones autocomplete and get typed params and results, the rest fall back to loose types
 */
export type Method = keyof Methods | (string & Record<never, never>)

export type Params<M extends string> = M extends keyof Methods
  ? Methods[M] extends { params: infer P }
    ? P
    : never
  : Readonly<Record<string, unknown>>

export type Result<M extends string> = M extends keyof Methods
  ? Methods[M] extends { result: infer R }
    ? R
    : never
  : unknown

/**
 * Row type of a list method: the array itself, or the single array a catalog style result wraps it in
 */
export type Item<M extends string> =
  Result<M> extends readonly (infer I)[]
    ? I
    : Result<M> extends Readonly<Record<string, readonly (infer I)[]>>
      ? I
      : unknown

/**
 * Positional arguments after the method name: params are optional when the method requires none
 */
export type Args<M extends string, O> =
  Readonly<Record<string, never>> extends Params<M>
    ? [params?: Params<M>, options?: O]
    : [params: Params<M>, options?: O]
