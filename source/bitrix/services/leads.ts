// tslint:disable:object-literal-sort-keys

import {
  GetPayload,
  GettableMethod,
  Lead,
  ListableMethod,
  ListOptions,
  ListPayload,
  Method
} from '../types'

interface Dependencies {
  readonly get: <P>(method: GettableMethod, query?: object | string) => Promise<GetPayload<P>>
  readonly list: <P>(method: ListableMethod, options?: ListOptions) => Promise<ListPayload<P>>
}

export default ({ get, list }: Dependencies) => ({
  get: () => get<Lead>(Method.GET_LEAD, {}),
  list: (options?: ListOptions) => list<Lead>(Method.LIST_LEADS, options)
})
