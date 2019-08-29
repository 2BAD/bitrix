// tslint:disable:object-literal-sort-keys

import {
  GetParams,
  GetPayload,
  GettableMethod,
  ListableMethod,
  ListParams,
  ListPayload,
  Method,
  Status
} from '../types'

interface Dependencies {
  readonly get: <P>(method: GettableMethod, params?: GetParams) => Promise<GetPayload<P>>
  readonly list: <P>(method: ListableMethod, params?: ListParams) => Promise<ListPayload<P>>
}

export default ({ get, list }: Dependencies) => ({
  get: (params?: GetParams) => get<Status>(Method.GET_STATUS, params),
  list: (params?: ListParams) => list<Status>(Method.LIST_STATUSES, params)
})
