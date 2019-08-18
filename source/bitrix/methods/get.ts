import { GotInstance, GotJSONFn } from 'got'
import { BitrixGetPayload, BitrixMethod } from '../types'

const handleGetPayload = <P>(payload: BitrixGetPayload<P>) => {
  // tslint:disable-next-line no-if-statement
  if (payload.error) {
  // tslint:disable-next-line no-throw
    throw new Error(
      `[get] failed to get the resource: ${payload.error}.`
    )
  }

  return payload
}

export default ({ get }: GotInstance<GotJSONFn>) =>
  <P>(method: BitrixMethod, options: object): Promise<BitrixGetPayload<P>> =>
    get(method, options)
      .then(({ body }) => handleGetPayload(body as BitrixGetPayload<P>))
