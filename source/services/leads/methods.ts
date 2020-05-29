import { ListParams, Method } from '../../methods'
import { GetPayload, ListPayload } from '../../payloads'
import { Fields } from '../common'
import { Lead } from './entities'

export type LeadsMethods = {
  readonly [Method.CRM_LEAD_FIELDS]: {
    readonly type: Lead
    readonly payload: GetPayload<Fields>
    readonly params?: Record<string, unknown>
  }

  readonly [Method.CRM_LEAD_ADD]: {
    readonly type: Lead
    readonly payload: GetPayload<number>
    readonly params: {
      readonly fields: Partial<Lead>
      readonly params?: {
        readonly REGISTER_SONET_EVENT: 'Y' | 'N'
      }
    }
  }
  readonly [Method.CRM_LEAD_GET]: {
    readonly type: Lead
    readonly payload: GetPayload<Lead>
    readonly params: {
      readonly id: string
    }
  }
  readonly [Method.CRM_LEAD_LIST]: {
    readonly type: Lead
    readonly payload: ListPayload<Lead>
    readonly params: ListParams
  }
  readonly [Method.CRM_LEAD_UPDATE]: {
    readonly type: Lead
    readonly payload: GetPayload<boolean>
    readonly params: {
      readonly id: string
      readonly fields: Record<string, unknown>
      readonly params?: {
        readonly REGISTER_SONET_EVENT: 'Y' | 'N'
      }
    }
  }
}
