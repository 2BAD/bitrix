import type { Core } from '../client.js'
import type { Id } from '../entities/crm.js'
import { BitrixError } from '../errors.js'
import type { Params } from '../methods.js'
import type { PaginateOptions } from '../paginate.js'

type UserListParams = Omit<Params<'user.get'>, 'ID'>
type UserPaginateOptions = Omit<PaginateOptions, 'mode' | 'idField'>

/**
 * `user.get` takes `sort` and `order` as plain strings instead of an order map, so users paginate by offset
 * @param core client methods the service is built on
 * @param core.call calls a single REST method
 * @param core.list reads every page of a list method
 * @param core.paginate iterates over every page of a list method
 */
export const createUsersService = ({ call, list, paginate }: Core) => ({
  fields: () => call('user.fields'),
  current: () => call('user.current'),
  get: async (id: Id) => {
    const [user] = await call('user.get', { ID: id })
    if (!user) throw new BitrixError({ code: 'NOT_FOUND', description: `user ${id} not found`, method: 'user.get' })
    return user
  },
  list: (params: UserListParams = {}, options: UserPaginateOptions = {}) =>
    list('user.get', params, { ...options, mode: 'offset' }),
  paginate: (params: UserListParams = {}, options: UserPaginateOptions = {}) =>
    paginate('user.get', params, { ...options, mode: 'offset' })
})
