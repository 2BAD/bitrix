// tslint:disable:object-literal-sort-keys

import {
  Deal,
  GetParams,
  GetPayload,
  GettableMethod,
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
  get: (params?: GetParams) => get<Deal>(Method.GET_DEAL, params),
  list: (params?: ListParams) => list<Deal>(Method.LIST_DEALS, params)
})
