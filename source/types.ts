import { BatchPayload, Commands, GetPayload, ListParams, ListPayload, Method } from './client/types'
import { Contact } from './services/types/contact'
import { Deal } from './services/types/deal'
import { Lead } from './services/types/lead'
import { Status } from './services/types/status'
import { ExtractValue } from './utils/ExtractValue'

interface MethodsMap {
  readonly [key: string]: {
    readonly type: unknown
    readonly payload: unknown
    readonly params: Record<string, any>
  }
}

/**
 * A mega map of all supported Bitrix methods to their parameters. Used to resolve
 * low-level client method required params and payload types.
 * - `type` — a type that method associated with
 * - `payload` — a payload that method returns
 * - `params` — params that method accepts
 */
export interface Methods extends MethodsMap {
  readonly [Method.BATCH]: {
    readonly type: unknown
    readonly payload: BatchPayload<unknown>
    readonly params: Commands
  }

  // Deals

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

  // Leads

  readonly [Method.CREATE_LEAD]: {
    readonly type: Lead
    readonly payload: GetPayload<number>
    readonly params: {
      readonly fields: Partial<Lead>
      readonly params?: {
        readonly REGISTER_SONET_EVENT: 'Y' | 'N'
      }
    }
  }
  readonly [Method.GET_LEAD]: {
    readonly type: Lead
    readonly payload: GetPayload<Lead>
    readonly params: {
      readonly id: string
    }
  }
  readonly [Method.LIST_LEADS]: {
    readonly type: Lead
    readonly payload: ListPayload<Lead>
    readonly params: ListParams
  }
  readonly [Method.UPDATE_LEAD]: {
    readonly type: Lead
    readonly payload: GetPayload<boolean>
    readonly params: {
      readonly id: string
      readonly fields: Record<string, any>
      readonly params?: {
        readonly REGISTER_SONET_EVENT: 'Y' | 'N'
      }
    }
  }

  // Contacts

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

  // Statuses

  readonly [Method.CREATE_STATUS]: {
    readonly type: Status
    readonly payload: GetPayload<number>
    readonly params: {
      readonly fields: Partial<Status>
    }
  }
  readonly [Method.GET_STATUS]: {
    readonly type: Status
    readonly payload: GetPayload<Status>
    readonly params: {
      readonly id: string
    }
  }
  readonly [Method.UPDATE_STATUS]: {
    readonly type: Status
    readonly payload: GetPayload<boolean>
    readonly params: {
      readonly id: string
      readonly fields: Record<string, any>
    }
  }
  readonly [Method.LIST_STATUSES]: {
    readonly type: Status
    readonly payload: ListPayload<Status>
    readonly params: ListParams
  }
}

/**
 * Retrieve specified method data
 */
export type MethodData<M extends Method> = ExtractValue<Methods, M>

/**
 * Retrieve associated with specified method type
 */
export type MethodPayloadType<M extends Method> = MethodData<M>['type']

/**
 * Retrieve specified method payload type
 */
export type MethodPayload<M extends Method> = MethodData<M>['payload']

/**
 * Retrieve specified method params
 */
export type MethodParams<M extends Method> = MethodData<M>['params']
