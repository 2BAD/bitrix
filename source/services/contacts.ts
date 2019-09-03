// tslint:disable:object-literal-sort-keys

import { Get } from '../client/methods/get'
import { List } from '../client/methods/list'
import { CreateParams, ListParams, Method, UpdateParams } from '../client/types'
import { Contact } from './types/contact'

interface Dependencies {
  readonly get: Get
  readonly list: List
}

export default ({ get, list }: Dependencies) => ({
  create: (fields: Partial<Contact>, params?: CreateParams['params']) =>
    get<number>(Method.CREATE_CONTACT, { fields, params }),
  get: (id: string) => get<Contact>(Method.GET_CONTACT, { id }),
  list: (params?: ListParams) => list<Contact>(Method.LIST_CONTACTS, params),
  update: (id: string, fields: Partial<Contact>, params?: UpdateParams['params']) =>
    get<boolean>(Method.UPDATE_CONTACT, { id, fields, params })
})
