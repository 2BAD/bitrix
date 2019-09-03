import { GotInstance, GotJSONFn } from 'got'
import { stringify as toQuery } from 'qs'
import { CreateParams, GetParams, GetPayload, GettableMethod, UpdateParams } from '../types'

export type Get = <P>(
  method: GettableMethod,
  // @todo Note that it isn't super accurate, since allows to use wrong params with any method.
  //       But for starters it will do.
  params?: CreateParams | GetParams | UpdateParams
) => Promise<GetPayload<P>>

/**
 * Dispatches a request with specified method and params.
 * Should be used for getting, creating or updating single items only, otherwise payload will be wrongly typed.
 * @note The naming is quite confusing, but we can't name it like a generic `call` since it isn't _that_ generic
 */
export default (got: GotInstance<GotJSONFn>): Get => {
  const get: Get = <P>(
    method: GettableMethod,
    params?: CreateParams | GetParams | UpdateParams
  ): Promise<GetPayload<P>> =>
    got.get(method, { query: toQuery(params) })
        .then(({ body }) => body as GetPayload<P>)

  return get
}
