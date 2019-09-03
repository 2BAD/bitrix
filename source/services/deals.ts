// tslint:disable:object-literal-sort-keys

import { Get } from '../client/methods/get'
import { List } from '../client/methods/list'
import { CreateParams, ListParams, Method, UpdateParams } from '../client/types'
import { Deal } from './types/deal'

interface Dependencies {
  readonly get: Get
  readonly list: List
}

export default ({ get, list }: Dependencies) => ({
  create: (fields: Partial<Deal>, params?: CreateParams['params']) =>
    get<number>(Method.CREATE_DEAL, { fields, params }),
  get: (id: string) => get<Deal>(Method.GET_DEAL, { id }),
  list: (params?: ListParams) => list<Deal>(Method.LIST_DEALS, params),
  update: (id: string, fields: Partial<Deal>, params?: UpdateParams['params']) =>
    get<boolean>(Method.UPDATE_DEAL, { id, fields, params })
})
