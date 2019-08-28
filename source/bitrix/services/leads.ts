// tslint:disable:object-literal-sort-keys

import {
  BitrixGetPayload,
  BitrixLead,
  BitrixListOptions,
  BitrixListPayload,
  GettableMethod,
  ListableMethod,
  Method
} from '../types'

interface Dependencies {
  readonly get: <P>(method: GettableMethod, query?: object | string) => Promise<BitrixGetPayload<P>>
  readonly list: <P>(method: ListableMethod, options?: BitrixListOptions) => Promise<BitrixListPayload<P>>
}

export default ({ get, list }: Dependencies) => ({
  get: () => get<BitrixLead>(Method.GET_DEAL, {}),
  list: (options?: BitrixListOptions) => list<BitrixLead>(Method.LIST_LEADS, options)
})
