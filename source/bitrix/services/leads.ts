// tslint:disable:object-literal-sort-keys

import {
  GetParams,
  GetPayload,
  GettableMethod,
  Lead,
  ListableMethod,
  ListParams,
  ListPayload,
  Method
} from '../types'

interface Dependencies {
  readonly get: <P>(method: GettableMethod, params?: GetParams) => Promise<GetPayload<P>>
  readonly list: <P>(method: ListableMethod, params?: ListParams) => Promise<ListPayload<P>>
}

export default ({ get, list }: Dependencies) => ({
  get: () => get<Lead>(Method.GET_LEAD, {}),
  list: (params?: ListParams) => list<Lead>(Method.LIST_LEADS, params)
})
