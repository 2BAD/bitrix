// tslint:disable:object-literal-sort-keys

import { Call } from '../../client/methods/call'
import { List } from '../../client/methods/list'
import { Method, MethodParams } from '../../method.types'

interface Dependencies {
  readonly call: Call
  readonly list: List
}

export default ({ call, list }: Dependencies) => ({
  create: <D extends MethodParams<Method.CREATE_LEAD>>(fields: D['fields'], params?: D['params']) =>
    call(Method.CREATE_LEAD, { fields, params }),

  get: (id: string) =>
    call(Method.GET_LEAD, { id }),

  list: (params: MethodParams<Method.LIST_LEADS> = {}) =>
    list(Method.LIST_LEADS, params),

  update: <D extends MethodParams<Method.UPDATE_LEAD>>(id: string, fields: D['fields'], params?: D['params']) =>
    call(Method.UPDATE_LEAD, { id, fields, params })
})
