// tslint:disable:object-literal-sort-keys

import { Call } from '../client/methods/call'
import { List } from '../client/methods/list'
import { Method, MethodParams } from '../method.types'

interface Dependencies {
  readonly call: Call
  readonly list: List
}

export default ({ call, list }: Dependencies) => ({
  get: (id: string) =>
    call(Method.GET_USER, { id }),

  list: (params: MethodParams<Method.LIST_USERS> = {}) =>
    list(Method.LIST_USERS, params)
})
