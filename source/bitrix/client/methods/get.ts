import { GotInstance, GotJSONFn } from 'got'
import { BitrixGetPayload, BitrixGettableMethod } from '../../types'

export default ({ get }: GotInstance<GotJSONFn>) =>
  <P>(method: BitrixGettableMethod, query?: object | string): Promise<BitrixGetPayload<P>> =>
    get(method, { query })
      .then(({ body }) => body as BitrixGetPayload<P>)
