// tslint:disable:object-literal-sort-keys

import { Get } from '../client/methods/get'
import { List } from '../client/methods/list'
import { Deal, GetParams, ListParams, Method } from '../types'

interface Dependencies {
  readonly get: Get
  readonly list: List
}

export default ({ get, list }: Dependencies) => ({
  get: (params?: GetParams) => get<Deal>(Method.GET_DEAL, params),
  list: (params?: ListParams) => list<Deal>(Method.LIST_DEALS, params)
})
