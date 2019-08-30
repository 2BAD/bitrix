import { GotInstance, GotJSONFn } from 'got'
import { stringify as toQuery } from 'qs'
import { GetParams, GetPayload, GettableMethod } from '../../types'

export type Get = <P>(method: GettableMethod, params?: GetParams) => Promise<GetPayload<P>>

export default (got: GotInstance<GotJSONFn>): Get => {
  const get: Get = <P>(method: GettableMethod, params?: GetParams): Promise<GetPayload<P>> =>
    got.get(method, { query: toQuery(params) })
        .then(({ body }) => body as GetPayload<P>)

  return get
}
