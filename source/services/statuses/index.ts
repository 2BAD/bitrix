// tslint:disable:object-literal-sort-keys

import { Call } from '../../client/methods/call'
import { List } from '../../client/methods/list'
import { Method, MethodParams } from '../../method.types'

interface Dependencies {
  readonly call: Call
  readonly list: List
}

export default ({ call, list }: Dependencies) => ({
  create: (fields: MethodParams<Method.CREATE_STATUS>['fields']) =>
    call(Method.CREATE_STATUS, { fields }),

  get: (id: string) =>
    call(Method.GET_STATUS, { id }),

  list: <D extends MethodParams<Method.LIST_STATUSES>>(order?: D['order'], filter?: D['filter']) =>
    list(Method.LIST_STATUSES, { order, filter }),

  update: (id: string, fields: MethodParams<Method.CREATE_STATUS>['fields']) =>
    call(Method.UPDATE_STATUS, { id, fields })
})
