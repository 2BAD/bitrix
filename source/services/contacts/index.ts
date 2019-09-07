// tslint:disable:object-literal-sort-keys

import { Call } from '../../client/methods/call'
import { List } from '../../client/methods/list'
import { Method, MethodParams } from '../../method.types'

interface Dependencies {
  readonly call: Call
  readonly list: List
}

export default ({ call, list }: Dependencies) => ({
  create: <D extends MethodParams<Method.CREATE_CONTACT>>(fields: D['fields'], params?: D['params']) =>
    call(Method.CREATE_CONTACT, { fields, params }),

  get: (id: string) =>
    call(Method.GET_CONTACT, { id }),

  list: (params: MethodParams<Method.LIST_CONTACTS> = {}) =>
    list(Method.LIST_CONTACTS, params),

  update: <D extends MethodParams<Method.UPDATE_CONTACT>>(id: string, fields: D['fields'], params?: D['params']) =>
    call(Method.UPDATE_CONTACT, { id, fields, params })
})
