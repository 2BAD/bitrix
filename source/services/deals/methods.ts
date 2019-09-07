import { ListParams, Method } from './../../method.types'
import { GetPayload, ListPayload } from './../../payload.types'
import { Deal } from './entities'

export interface DealsMethods {
  readonly [Method.CREATE_DEAL]: {
    readonly type: Deal
    readonly payload: GetPayload<number>
    readonly params: {
      readonly fields: Partial<Deal>
      readonly params?: {
        readonly REGISTER_SONET_EVENT: 'Y' | 'N'
      }
    }
  }
  readonly [Method.GET_DEAL]: {
    readonly type: Deal
    readonly payload: GetPayload<Deal>
    readonly params: {
      readonly id: string
    }
  }
  readonly [Method.UPDATE_DEAL]: {
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
  readonly [Method.LIST_DEALS]: {
    readonly type: Deal
    readonly payload: ListPayload<Deal>
    readonly params: ListParams
  }
}
