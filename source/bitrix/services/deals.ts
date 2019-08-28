// tslint:disable:object-literal-sort-keys

import {
  APIMethod,
  BitrixDeal,
  BitrixGetPayload,
  BitrixGettableMethod,
  BitrixListableMethod,
  BitrixListOptions,
  BitrixListPayload
} from '../types'

interface Dependencies {
  readonly get: <P>(method: BitrixGettableMethod, query?: object | string) => Promise<BitrixGetPayload<P>>
  readonly list: <P>(method: BitrixListableMethod, options?: BitrixListOptions) => Promise<BitrixListPayload<P>>
}

export default ({ get, list }: Dependencies) => ({
  get: () => get<BitrixDeal>(APIMethod.GET_DEAL, {}),
  list: (options?: BitrixListOptions) => list<BitrixDeal>(APIMethod.LIST_DEALS, options)
})
