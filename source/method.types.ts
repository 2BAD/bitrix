import { Commands } from './command.types'
import { Contact } from './entities/contact'
import { Deal } from './entities/deal'
import { Lead } from './entities/lead'
import { Status } from './entities/status'
import { User } from './entities/user'
import { BatchPayload, GetPayload, ListPayload } from './payload.types'
import { Diff } from './utils/Diff'
import { ExtractValue } from './utils/ExtractValue'

export enum Method {
  // Gettable
  BATCH = 'batch',

  GET_CONTACT = 'crm.contact.get',
  GET_DEAL = 'crm.deal.get',
  GET_LEAD = 'crm.lead.get',
  GET_STATUS = 'crm.status.get',
  GET_USER = 'user.get',

  CREATE_CONTACT = 'crm.contact.add',
  CREATE_DEAL = 'crm.deal.add',
  CREATE_LEAD = 'crm.lead.add',
  CREATE_STATUS = 'crm.status.add',

  UPDATE_CONTACT = 'crm.contact.update',
  UPDATE_DEAL = 'crm.deal.update',
  UPDATE_LEAD = 'crm.lead.update',
  UPDATE_STATUS = 'crm.status.update',

  // Listable
  LIST_CONTACTS = 'crm.contact.list',
  LIST_DEALS = 'crm.deal.list',
  LIST_LEADS = 'crm.lead.list',
  LIST_STATUSES = 'crm.status.list',
  // yes, this one is correct, they don't have separate `list` method and this one returns all users
  LIST_USERS = 'user.search'
}

const LISTABLE_METHODS = [
  Method.LIST_CONTACTS,
  Method.LIST_DEALS,
  Method.LIST_LEADS,
  Method.LIST_STATUSES,
  Method.LIST_USERS
] as const

export type ListableMethod = typeof LISTABLE_METHODS[number]
export type GettableMethod = Diff<Method, ListableMethod>

interface MethodsMap {
  readonly [key: string]: {
    readonly type: unknown
    readonly payload: unknown
    readonly params: Record<string, any>
  }
}

// @todo Figure out full list of possible values
export interface ListParams {
  readonly start?: number
  readonly order?: { readonly [key: string]: 'ASC' }
  readonly filter?: { readonly '>PROBABILITY': number }
  readonly select?: ReadonlyArray<'*' | 'UF_*' | string>
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

  // Users
  readonly [Method.GET_USER]: {
    readonly type: User
    readonly payload: GetPayload<User>
    readonly params: {
      readonly id: string
    }
  }
  readonly [Method.LIST_USERS]: {
    readonly type: User
    readonly payload: ListPayload<User>
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
