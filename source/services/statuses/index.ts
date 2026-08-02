import type { Call } from '../../client/methods/call.js'
import { Method, type MethodParams } from '../../methods.js'

type Dependencies = {
  readonly call: Call
}

export default ({ call }: Dependencies) => ({
  fields: () => call(Method.CRM_STATUS_FIELDS, {}),

  create: (fields: MethodParams<typeof Method.CRM_STATUS_ADD>['fields']) => call(Method.CRM_STATUS_ADD, { fields }),

  delete: (id: string | number, params: MethodParams<typeof Method.CRM_STATUS_DELETE>['params'] = {}) =>
    call(Method.CRM_STATUS_DELETE, { id, params }),

  get: (id: string | number) => call(Method.CRM_STATUS_GET, { id }),

  list: (params: MethodParams<typeof Method.CRM_STATUS_LIST> = {}) => call(Method.CRM_STATUS_LIST, params),

  update: (id: string | number, fields: MethodParams<typeof Method.CRM_STATUS_UPDATE>['fields']) =>
    call(Method.CRM_STATUS_UPDATE, { id, fields })
})
