import { ListParams, Method } from './../../method.types'
import { GetPayload, ListPayload } from './../../payload.types'
import { Contact } from './entities'

export interface ContactsMethods {
  readonly [Method.CREATE_CONTACT]: {
    readonly type: Contact
    readonly payload: GetPayload<number>
    readonly params: {
      readonly fields: Partial<Contact>
      readonly params?: {
        readonly REGISTER_SONET_EVENT: 'Y' | 'N'
      }
    }
  }
  readonly [Method.GET_CONTACT]: {
    readonly type: Contact
    readonly payload: GetPayload<Contact>
    readonly params: {
      readonly id: string
    }
  }
  readonly [Method.LIST_CONTACTS]: {
    readonly type: Contact
    readonly payload: ListPayload<Contact>
    readonly params: ListParams
  }
  readonly [Method.UPDATE_CONTACT]: {
    readonly type: Contact
    readonly payload: GetPayload<boolean>
    readonly params: {
      readonly id: string
      readonly fields: Record<string, any>
      readonly params?: {
        readonly REGISTER_SONET_EVENT: 'Y' | 'N'
      }
    }
  }
}
