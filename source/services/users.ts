// tslint:disable:object-literal-sort-keys

import { Call } from '../client/methods/call'
import { List } from '../client/methods/list'
import { Method, MethodParams } from '../method.types'

interface Dependencies {
  readonly call: Call
  readonly list: List
}

export default ({ list }: Dependencies) => ({
  get: (id: string) =>
    list(Method.USER_GET, { id }),

  list: (params: MethodParams<Method.USER_SEARCH> = {}) =>
    list(Method.USER_SEARCH, params)
})
