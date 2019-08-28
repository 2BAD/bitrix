// tslint:disable:object-literal-sort-keys

import {
  APIMethod,
  BitrixGetPayload,
  BitrixGettableMethod,
  BitrixLead,
  BitrixListableMethod,
  BitrixListOptions,
  BitrixListPayload
} from '../types'

interface Dependencies {
  readonly get: <P>(method: BitrixGettableMethod, query?: object | string) => Promise<BitrixGetPayload<P>>
  readonly list: <P>(method: BitrixListableMethod, options?: BitrixListOptions) => Promise<BitrixListPayload<P>>
}

export default ({ get, list }: Dependencies) => ({
  get: () => get<BitrixLead>(APIMethod.GET_DEAL, {}),
  list: (options?: BitrixListOptions) => list<BitrixLead>(APIMethod.LIST_LEADS, options)
})
