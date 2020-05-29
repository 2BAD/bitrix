import { ListParams, Method } from '../../methods'
import { GetPayload, ListPayload } from '../../payloads'
import { Fields } from '../common'
import { Deal } from './entities'

export interface DealsMethods {
  readonly [Method.CRM_DEAL_FIELDS]: {
    readonly type: Deal
    readonly payload: GetPayload<Fields>
    readonly params?: Record<string, unknown>
  }

  readonly [Method.CRM_DEAL_ADD]: {
    readonly type: Deal
    readonly payload: GetPayload<number>
    readonly params: {
      readonly fields: Partial<Deal>
      readonly params?: {
        readonly REGISTER_SONET_EVENT: 'Y' | 'N'
      }
    }
  }
  readonly [Method.CRM_DEAL_GET]: {
    readonly type: Deal
    readonly payload: GetPayload<Deal>
    readonly params: {
      readonly id: string
    }
  }
  readonly [Method.CRM_DEAL_LIST]: {
    readonly type: Deal
    readonly payload: ListPayload<Deal>
    readonly params: ListParams
  }
  readonly [Method.CRM_DEAL_UPDATE]: {
    readonly type: Deal
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
