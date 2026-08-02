import type { Call } from '../../client/methods/call.js'
import type { List } from '../../client/methods/list.js'
import { Method, type MethodParams } from '../../methods.js'

type Dependencies = {
  readonly call: Call
  readonly list: List
}

export default ({ call, list }: Dependencies) => ({
  fields: () => call(Method.CRM_COMPANY_FIELDS, {}),

  create: <D extends MethodParams<typeof Method.CRM_COMPANY_ADD>>(fields: D['fields'], params?: D['params']) =>
    call(Method.CRM_COMPANY_ADD, { fields, params }),

  get: (id: string) => call(Method.CRM_COMPANY_GET, { id }),

  list: (params: MethodParams<typeof Method.CRM_COMPANY_LIST> = {}) => list(Method.CRM_COMPANY_LIST, params),

  update: <D extends MethodParams<typeof Method.CRM_COMPANY_UPDATE>>(
    id: string,
    fields: D['fields'],
    params?: D['params']
  ) => call(Method.CRM_COMPANY_UPDATE, { id, fields, params })
})
