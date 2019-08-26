import { GotInstance, GotJSONFn } from 'got'
import { BitrixGetPayload, BitrixMethod } from '../types'

export default ({ get }: GotInstance<GotJSONFn>) =>
  <P>(method: BitrixMethod, query: object | string): Promise<BitrixGetPayload<P>> =>
    get(method, { query })
      .then(({ body }) => body as BitrixGetPayload<P>)
