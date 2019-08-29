import { GotInstance, GotJSONFn } from 'got'
import { stringify as toQuery } from 'qs'
import { GetParams, GetPayload, GettableMethod } from '../../types'

export default ({ get }: GotInstance<GotJSONFn>) =>
  <P>(method: GettableMethod, params?: GetParams): Promise<GetPayload<P>> =>
    get(method, { query: toQuery(params) })
      .then(({ body }) => body as GetPayload<P>)
