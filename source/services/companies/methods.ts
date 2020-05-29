import { ListParams, Method } from '../../methods'
import { GetPayload, ListPayload } from '../../payloads'
import { Fields } from '../common'
import { Company } from './entities'

export interface CompaniesMethods {
  readonly [Method.CRM_COMPANY_FIELDS]: {
    readonly type: Company
    readonly payload: GetPayload<Fields>
    readonly params?: Record<string, unknown>
  }

  readonly [Method.CRM_COMPANY_ADD]: {
    readonly type: Company
    readonly payload: GetPayload<number>
    readonly params: {
      readonly fields: Partial<Company>
      readonly params?: {
        readonly REGISTER_SONET_EVENT: 'Y' | 'N'
      }
    }
  }
  readonly [Method.CRM_COMPANY_GET]: {
    readonly type: Company
    readonly payload: GetPayload<Company>
    readonly params: {
      readonly id: string
    }
  }
  readonly [Method.CRM_COMPANY_LIST]: {
    readonly type: Company
    readonly payload: ListPayload<Company>
    readonly params: ListParams
  }
  readonly [Method.CRM_COMPANY_UPDATE]: {
    readonly type: Company
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
