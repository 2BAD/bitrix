import { GotInstance, GotJSONFn } from 'got'
import { stringify as toQuery } from 'qs'
import { ListableMethod, ListParams, ListPayload } from '../types'

/**
 * Checks wether payload has error and if yes — throws it
 */
export const handleGetListPayload = <P>(payload: ListPayload<P>) => {
  // tslint:disable-next-line no-if-statement
  if (payload.error) {
  // tslint:disable-next-line no-throw
    throw new Error(
      `[get] failed to get the resource: ${payload.error}.`
    )
  }

  return payload
}

export type GetList = <P>(method: ListableMethod, params?: ListParams) => Promise<ListPayload<P>>

/**
 * Dispatches a request with specified method and params.
 * Should be used for getting list-items only, otherwise payload will be wrongly typed.
 * @todo `getList` is temporary workaround. Bitrix will return different signature
 *        depending on `get` and `list` methods. Until we can automatically
 *        map those types based on methods and thus infer output types, we need this helper
 */
export default (got: GotInstance<GotJSONFn>): GetList => {
  const getList: GetList = <P>(
    method: ListableMethod,
    params?: ListParams
  ): Promise<ListPayload<P>> =>
    got.get(method, { query: toQuery(params) })
      .then(({ body }) => handleGetListPayload(body as ListPayload<P>))

  return getList
}
