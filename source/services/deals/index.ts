// tslint:disable:object-literal-sort-keys

import { Call } from '../../client/methods/call'
import { List } from '../../client/methods/list'
import { Method, MethodParams } from '../../methods'

interface Dependencies {
  readonly call: Call
  readonly list: List
}

export default ({ call, list }: Dependencies) => ({
  create: <D extends MethodParams<Method.CRM_DEAL_ADD>>(fields: D['fields'], params?: D['params']) =>
    call(Method.CRM_DEAL_ADD, { fields, params }),

  get: (id: string) =>
    call(Method.CRM_DEAL_GET, { id }),

  list: (params: MethodParams<Method.CRM_DEAL_LIST> = {}) =>
    list(Method.CRM_DEAL_LIST, params),

  update: <D extends MethodParams<Method.CRM_DEAL_UPDATE>>(id: string, fields: D['fields'], params?: D['params']) =>
    call(Method.CRM_DEAL_UPDATE, { id, fields, params })
})
