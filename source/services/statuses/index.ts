// tslint:disable:object-literal-sort-keys

import { Call } from '../../client/methods/call'
import { Method, MethodParams } from '../../method.types'

interface Dependencies {
  readonly call: Call
}

export default ({ call }: Dependencies) => ({
  create: (fields: MethodParams<Method.CREATE_STATUS>['fields']) =>
    call(Method.CREATE_STATUS, { fields }),

  get: (id: string) =>
    call(Method.GET_STATUS, { id }),

  list: (params: MethodParams<Method.LIST_STATUSES> = {}) =>
    call(Method.LIST_STATUSES, params),

  update: (id: string, fields: MethodParams<Method.CREATE_STATUS>['fields']) =>
    call(Method.UPDATE_STATUS, { id, fields })
})
