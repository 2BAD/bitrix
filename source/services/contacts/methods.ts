import { ListParams, Method } from '../../methods'
import { GetPayload, ListPayload } from '../../payloads'
import { Contact } from './entities'

export interface ContactsMethods {
  readonly [Method.CRM_CONTACT_ADD]: {
    readonly type: Contact
    readonly payload: GetPayload<number>
    readonly params: {
      readonly fields: Partial<Contact>
      readonly params?: {
        readonly REGISTER_SONET_EVENT: 'Y' | 'N'
      }
    }
  }
  readonly [Method.CRM_CONTACTS_GET]: {
    readonly type: Contact
    readonly payload: GetPayload<Contact>
    readonly params: {
      readonly id: string
    }
  }
  readonly [Method.CRM_CONTACT_LIST]: {
    readonly type: Contact
    readonly payload: ListPayload<Contact>
    readonly params: ListParams
  }
  readonly [Method.CRM_CONTACT_UPDATE]: {
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
