// tslint:disable:object-literal-sort-keys

import { Get } from '../client/methods/get'
import { List } from '../client/methods/list'
import { GetParams, ListParams, Method, Status } from '../types'

interface Dependencies {
  readonly get: Get
  readonly list: List
}

export default ({ get, list }: Dependencies) => ({
  get: (params?: GetParams) => get<Status>(Method.GET_STATUS, params),
  list: (params?: ListParams) => list<Status>(Method.LIST_STATUSES, params)
})
