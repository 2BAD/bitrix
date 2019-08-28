// tslint:disable:object-literal-sort-keys

import {
  APIGettableMethod,
  APIListableMethod,
  APIMethod,
  BitrixDeal,
  BitrixGetPayload,
  BitrixListOptions,
  BitrixListPayload
} from '../types'

interface Dependencies {
  readonly get: <P>(method: APIGettableMethod, query?: object | string) => Promise<BitrixGetPayload<P>>
  readonly list: <P>(method: APIListableMethod, options?: BitrixListOptions) => Promise<BitrixListPayload<P>>
}

export default ({ get, list }: Dependencies) => ({
  get: () => get<BitrixDeal>(APIMethod.GET_DEAL, {}),
  list: (options?: BitrixListOptions) => list<BitrixDeal>(APIMethod.LIST_DEALS, options)
})
