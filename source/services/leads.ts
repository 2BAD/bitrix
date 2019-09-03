// tslint:disable:object-literal-sort-keys

import { Get } from '../client/methods/get'
import { List } from '../client/methods/list'
import { CreateParams, ListParams, Method, UpdateParams } from '../client/types'
import { Lead } from './types/lead'

interface Dependencies {
  readonly get: Get
  readonly list: List
}

export default ({ get, list }: Dependencies) => ({
  create: (fields: Partial<Lead>, params?: CreateParams['params']) =>
    get<number>(Method.CREATE_LEAD, { fields, params }),
  get: (id: string) => get<Lead>(Method.GET_LEAD, { id }),
  list: (params?: ListParams) => list<Lead>(Method.LIST_LEADS, params),
  update: (id: string, fields: Partial<Lead>, params?: UpdateParams['params']) =>
    get<boolean>(Method.UPDATE_LEAD, { id, fields, params })
})
