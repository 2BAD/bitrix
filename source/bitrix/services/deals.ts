// tslint:disable:object-literal-sort-keys

import {
  APIGettableMethod,
  BitrixDeal,
  BitrixGetPayload,
  BitrixListOptions,
  BitrixListPayload,
  ListableMethod,
  Method
} from '../types'

interface Dependencies {
  readonly get: <P>(method: APIGettableMethod, query?: object | string) => Promise<BitrixGetPayload<P>>
  readonly list: <P>(method: ListableMethod, options?: BitrixListOptions) => Promise<BitrixListPayload<P>>
}

export default ({ get, list }: Dependencies) => ({
  get: () => get<BitrixDeal>(Method.GET_DEAL, {}),
  list: (options?: BitrixListOptions) => list<BitrixDeal>(Method.LIST_DEALS, options)
})
