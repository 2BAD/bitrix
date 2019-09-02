// tslint:disable:object-literal-sort-keys

import { Get } from '../client/methods/get'
import { List } from '../client/methods/list'
import { ListParams, Method } from '../client/types'
import { Status } from './types/status'

interface Dependencies {
  readonly get: Get
  readonly list: List
}

export default ({ get, list }: Dependencies) => ({
  get: (id: string) => get<Status>(Method.GET_STATUS, { ID: id }),
  list: (params?: ListParams) => list<Status>(Method.LIST_STATUSES, params)
})
