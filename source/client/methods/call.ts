import { GotInstance, GotJSONFn } from 'got'
import { stringify as toQuery } from 'qs'
import { MethodParams, MethodPayload } from '../../types'
import isArray from '../../utils/isArray'
import { BatchPayload, ListPayload, Method, Payload } from '../types'

/**
 * Checks wether payload have any errors and if it does — throws them
 * Bitrix payload types do not provide discriminators, so we're forced to type cast them
 */
export const handlePayload = <P extends Payload<unknown>>(payload: P): P => {
  // tslint:disable-next-line no-if-statement
  if ((payload as ListPayload<unknown>).error) {
  // tslint:disable-next-line no-throw
    throw new Error(
      `[call] failed to get the resource: ${(payload as ListPayload<unknown>).error}.`
    )
  }

  // tslint:disable-next-line no-if-statement
  if ((payload as BatchPayload<unknown>).result && (payload as BatchPayload<unknown>).result.result_error) {
    const resultErrors = (payload as BatchPayload<unknown>).result.result_error
    const errors = isArray(resultErrors) ? resultErrors : Object.values(resultErrors)

    // tslint:disable-next-line no-if-statement
    if (errors.length > 0) {
      // @todo We can give better formatting to display errored commands. But it's not important for now
      // tslint:disable-next-line no-throw
      throw new Error(`[batch] failed to process. Received errors in ${errors.length} commands:\n${errors.join('\n')}`)
    }
  }

  return payload
}

export type Call = <M extends Method>(method: M, params: MethodParams<M>) => Promise<MethodPayload<M>>

/**
 * Dispatches a request with specified method and params. Will fill figure out payload type based on the Method
 */
export default (got: GotInstance<GotJSONFn>): Call => {
  const call: Call = <M extends Method>(method: M, params: MethodParams<M>): Promise<MethodPayload<M>> =>
    got.get(method, { query: toQuery(params) })
      .then(({ body }) => handlePayload(body as MethodPayload<M>))

  return call
}
