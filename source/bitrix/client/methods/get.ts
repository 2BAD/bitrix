import { GotInstance, GotJSONFn } from 'got'
import { BitrixGetPayload, GettableMethod } from '../../types'

export default ({ get }: GotInstance<GotJSONFn>) =>
  <P>(method: GettableMethod, query?: object | string): Promise<BitrixGetPayload<P>> =>
    get(method, { query })
      .then(({ body }) => body as BitrixGetPayload<P>)
