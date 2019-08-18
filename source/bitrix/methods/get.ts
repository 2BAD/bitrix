import { GotInstance, GotJSONFn } from 'got'
import { BitrixGetPayload, BitrixMethod } from '../types'

export default ({ get }: GotInstance<GotJSONFn>) =>
  <P>(method: BitrixMethod, options: object): Promise<BitrixGetPayload<P>> =>
    get(method, options)
      .then(({ body }) => body as BitrixGetPayload<P>)
