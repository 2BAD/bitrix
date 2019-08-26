// tslint:disable:object-literal-sort-keys

import {
  BitrixGetPayload,
  BitrixGettableMethod,
  BitrixLead,
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
  get: () => get<BitrixLead>(BitrixMethod.GET_DEAL, {}),
  list: (options?: BitrixListOptions) => list<BitrixLead>(BitrixMethod.LIST_LEADS, options)
})
