import { Call } from '../../client/methods/call'
import { Method } from '../../methods'

type Dependencies = {
  readonly call: Call
}

export default ({ call }: Dependencies) => ({
  fields: () =>
    call(Method.USER_FIELDS, {}),

  get: (id?: string) =>
    call(Method.USER_GET, { id })
})
