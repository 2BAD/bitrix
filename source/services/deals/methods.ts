import { ListParams, Method } from './../../method.types'
import { GetPayload, ListPayload } from './../../payload.types'
import { Deal } from './entities'

export interface DealsMethods {
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
      readonly fields: Record<string, any>
      readonly params?: {
        readonly REGISTER_SONET_EVENT: 'Y' | 'N'
      }
    }
  }
}
