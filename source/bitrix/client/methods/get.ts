import { GotInstance, GotJSONFn } from 'got'
import { GetParams, GetPayload, GettableMethod } from '../../types'

export default ({ get }: GotInstance<GotJSONFn>) =>
  <P>(method: GettableMethod, params?: GetParams): Promise<GetPayload<P>> =>
    get(method, { query: params })
      .then(({ body }) => body as GetPayload<P>)
