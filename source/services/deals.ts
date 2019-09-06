// tslint:disable:object-literal-sort-keys

import { Call } from '../client/methods/call'
import { List } from '../client/methods/list'
import { Method, MethodParams } from '../method.types'

interface Dependencies {
  readonly call: Call
  readonly list: List
}

export default ({ call, list }: Dependencies) => ({
  create: <D extends MethodParams<Method.CREATE_DEAL>>(fields: D['fields'], params?: D['params']) =>
    call(Method.CREATE_DEAL, { fields, params }),

  get: (id: string) =>
    call(Method.GET_DEAL, { id }),

  list: (params: MethodParams<Method.LIST_DEALS> = {}) =>
    list(Method.LIST_DEALS, params),

  update: <D extends MethodParams<Method.UPDATE_DEAL>>(id: string, fields: D['fields'], params?: D['params']) =>
    call(Method.UPDATE_DEAL, { id, fields, params })
})
