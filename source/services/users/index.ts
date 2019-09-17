// tslint:disable:object-literal-sort-keys

import { Call } from '../../client/methods/call'
import { Method } from '../../methods'

interface Dependencies {
  readonly call: Call
}

export default ({ call }: Dependencies) => ({
  fields: () =>
    call(Method.USER_FIELDS, {}),

  get: (id?: string) =>
    call(Method.USER_GET, { id })
})
