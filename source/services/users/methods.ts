import { Method } from '../../methods.js'
import { GetPayload } from '../../payloads.js'
import { User } from './entities.js'

export type UsersMethods = {
  readonly [Method.USER_FIELDS]: {
    readonly type: User
    readonly payload: GetPayload<User>
    readonly params?: Record<string, unknown>
  }

  readonly [Method.USER_GET]: {
    readonly type: User
    readonly payload: GetPayload<readonly User[]>
    readonly params: {
      readonly id?: string
    }
  }
}
