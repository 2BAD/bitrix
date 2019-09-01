import { GotInstance, GotJSONFn } from 'got'
import { stringify as toQuery } from 'qs'
import { GetParams, GetPayload, GettableMethod } from '../types'

export type Get = <P>(method: GettableMethod, params?: GetParams) => Promise<GetPayload<P>>

/**
 * Dispatches a request with specified method and params.
 * Should be used for getting single items only, otherwise payload will be wrongly typed.
 */
export default (got: GotInstance<GotJSONFn>): Get => {
  const get: Get = <P>(method: GettableMethod, params?: GetParams): Promise<GetPayload<P>> =>
    got.get(method, { query: toQuery(params) })
        .then(({ body }) => body as GetPayload<P>)

  return get
}
