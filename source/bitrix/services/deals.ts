// tslint:disable:object-literal-sort-keys

import {
  BitrixDeal,
  BitrixGetPayload,
  BitrixGettableMethod,
  BitrixListableMethod,
  BitrixListOptions,
  BitrixListPayload,
  BitrixMethod
} from '../types'

interface Dependencies {
  readonly get: <P>(method: BitrixGettableMethod, query?: object | string) => Promise<BitrixGetPayload<P>>
  readonly list: <P>(method: BitrixListableMethod, options?: BitrixListOptions) => Promise<BitrixListPayload<P>>
}

export default ({ get, list }: Dependencies) => ({
  get: () => get<BitrixDeal>(BitrixMethod.GET_DEAL, {}),
  list: (options?: BitrixListOptions) => list<BitrixDeal>(BitrixMethod.LIST_DEALS, options)
})
