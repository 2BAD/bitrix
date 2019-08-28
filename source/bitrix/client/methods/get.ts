import { GotInstance, GotJSONFn } from 'got'
import { APIGettableMethod, BitrixGetPayload } from '../../types'

export default ({ get }: GotInstance<GotJSONFn>) =>
  <P>(method: APIGettableMethod, query?: object | string): Promise<BitrixGetPayload<P>> =>
    get(method, { query })
      .then(({ body }) => body as BitrixGetPayload<P>)
