import { Method } from '../../methods.js'
import { GetPayload, ListPayload } from '../../payloads.js'
import { Fields } from '../common.js'
import { Status } from './entities.js'

export type StatusesMethods = {
  // https://dev.1c-bitrix.ru/rest_help/crm/auxiliary/status/crm_status_fields.php
  readonly [Method.CRM_STATUS_FIELDS]: {
    readonly type: Status
    readonly payload: GetPayload<Fields>
    readonly params?: Record<string, unknown>
  }

  // https://dev.1c-bitrix.ru/rest_help/crm/auxiliary/status/crm_status_add.php
  readonly [Method.CRM_STATUS_ADD]: {
    readonly type: Status
    readonly payload: GetPayload<number>
    readonly params: {
      readonly fields: Partial<Status>
    }
  }

  // https://dev.1c-bitrix.ru/rest_help/crm/auxiliary/status/crm_status_delete.php
  readonly [Method.CRM_STATUS_DELETE]: {
    readonly type: Status
    readonly payload: GetPayload<boolean>
    readonly params: {
      readonly id: string | number
      readonly params?: {
        readonly FORCED?: 'Y' | 'N'
      }
    }

  }

  // https://dev.1c-bitrix.ru/rest_help/crm/auxiliary/status/crm_status_get.php
  readonly [Method.CRM_STATUS_GET]: {
    readonly type: Status
    readonly payload: GetPayload<Status>
    readonly params: {
      readonly id: string | number
    }
  }

  // https://dev.1c-bitrix.ru/rest_help/crm/auxiliary/status/crm_status_list.php
  readonly [Method.CRM_STATUS_LIST]: {
    readonly type: Status
    readonly payload: ListPayload<Status>
    readonly params: {
      // @todo should be refined to only available properties
      readonly order?: Record<string, unknown>
      readonly filter?: Record<string, unknown>
    }
  }

  // https://dev.1c-bitrix.ru/rest_help/crm/auxiliary/status/crm_status_update.php
  readonly [Method.CRM_STATUS_UPDATE]: {
    readonly type: Status
    readonly payload: GetPayload<boolean>
    readonly params: {
      readonly id: string | number
      readonly fields: Record<string, unknown>
    }
  }
}
