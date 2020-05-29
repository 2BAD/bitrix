import got from 'got'
import { stringify as toQuery } from 'qs'
import { Method, MethodParams, MethodPayload } from '../../methods'
import { BatchPayload, ListPayload, Payload } from '../../payloads'
import isArray from '../../utils/isArray'

/**
 * Checks wether payload have any errors and if it does — throws them
 * Bitrix payload types do not provide discriminators, so we're forced to type cast them
 */
export const handlePayload = <P extends Payload<unknown>>(payload: P): P => {
  if ((payload as ListPayload<unknown>).error) {
    throw new Error(
      `[call] failed to get the resource: ${(payload as ListPayload<unknown>).error ?? ''}.`
    )
  }

  if ((payload as BatchPayload<unknown>).result && (payload as BatchPayload<unknown>).result.result_error) {
    const resultErrors = (payload as BatchPayload<unknown>).result.result_error
    const errors = isArray(resultErrors) ? resultErrors : Object.values(resultErrors)

    if (errors.length > 0) {
      // @todo We can give better formatting to display errored commands. But it's not important for now
      throw new Error(`[batch] failed to process. Received errors in ${errors.length} commands:\n${errors.join('\n')}`)
    }
  }

  return payload
}

export type Call = <M extends Method>(method: M, params: MethodParams<M>) => Promise<MethodPayload<M>>

type Dependencies = {
  readonly get: typeof got.get
}

/**
 * Dispatches a request with specified method and params. Will fill figure out payload type based on the Method
 */
export default ({ get }: Dependencies): Call => {
  const call: Call = <M extends Method>(method: M, params: MethodParams<M>): Promise<MethodPayload<M>> =>
    get<MethodPayload<M>>(method, { searchParams: toQuery(params) })
      .then(({ body }) => handlePayload(body))

  return call
}
