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
  create: (fields: Partial<Status>) => get<number>(Method.CREATE_STATUS, { fields }),
  get: (id: string) => get<Status>(Method.GET_STATUS, { id }),
  list: (params?: ListParams) => list<Status>(Method.LIST_STATUSES, params),
  update: (id: string, fields: Partial<Status>) => get<boolean>(Method.UPDATE_STATUS, { id, fields })
})
