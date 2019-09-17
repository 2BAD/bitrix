import { Method } from '../../methods'
import { GetPayload } from '../../payloads'
import { User } from './entities'

export interface UsersMethods {
  readonly [Method.USER_FIELDS]: {
    readonly type: User
    readonly payload: GetPayload<User>
    readonly params?: {}
  }

  readonly [Method.USER_GET]: {
    readonly type: User
    readonly payload: GetPayload<User>
    readonly params: {
      readonly id?: string
    }
  }
}
