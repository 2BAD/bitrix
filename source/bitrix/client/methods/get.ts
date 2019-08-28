import { GotInstance, GotJSONFn } from 'got'
import { GetPayload, GettableMethod } from '../../types'

export default ({ get }: GotInstance<GotJSONFn>) =>
  <P>(method: GettableMethod, query?: object | string): Promise<GetPayload<P>> =>
    get(method, { query })
      .then(({ body }) => body as GetPayload<P>)
