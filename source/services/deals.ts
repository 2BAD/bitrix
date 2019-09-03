// tslint:disable:object-literal-sort-keys

import { Get } from '../client/methods/get'
import { List } from '../client/methods/list'
import { ListParams, Method } from '../client/types'
import { Deal } from './types/deal'

interface Dependencies {
  readonly get: Get
  readonly list: List
}

export default ({ get, list }: Dependencies) => ({
  get: (id: string) => get<Deal>(Method.GET_DEAL, { id }),
  list: (params?: ListParams) => list<Deal>(Method.LIST_DEALS, params)
})
