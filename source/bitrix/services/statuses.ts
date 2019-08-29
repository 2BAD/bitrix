// tslint:disable:object-literal-sort-keys

import {
  GetPayload,
  GettableMethod,
  ListableMethod,
  ListOptions,
  ListPayload,
  Method,
  Status
} from '../types'

interface Dependencies {
  readonly get: <P>(method: GettableMethod, query?: object | string) => Promise<GetPayload<P>>
  readonly list: <P>(method: ListableMethod, options?: ListOptions) => Promise<ListPayload<P>>
}

export default ({ get, list }: Dependencies) => ({
  get: () => get<Status>(Method.GET_STATUS, {}),
  list: (options?: ListOptions) => list<Status>(Method.LIST_STATUSES, options)
})
