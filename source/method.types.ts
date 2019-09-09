import { Commands } from './command.types'
import { BatchPayload } from './payload.types'
import { ContactsMethods } from './services/contacts/methods'
import { DealsMethods } from './services/deals/methods'
import { LeadsMethods } from './services/leads/methods'
import { StatusesMethods } from './services/statuses/methods'
import { Diff } from './utils/Diff'
import { ExtractValue } from './utils/ExtractValue'

export enum Method {
  // Gettable
  BATCH = 'batch',

  CRM_CONTACTS_GET = 'crm.contact.get',
  CRM_DEAL_GET = 'crm.deal.get',
  CRM_LEAD_GET = 'crm.lead.get',
  CRM_STATUS_GET = 'crm.status.get',

  CRM_CONTACT_ADD = 'crm.contact.add',
  CRM_DEAL_ADD = 'crm.deal.add',
  CRM_LEAD_ADD = 'crm.lead.add',
  CRM_STATUS_ADD = 'crm.status.add',

  CRM_CONTACT_UPDATE = 'crm.contact.update',
  CRM_DEAL_UPDATE = 'crm.deal.update',
  CRM_LEAD_UPDATE = 'crm.lead.update',
  CRM_STATUS_UPDATE = 'crm.status.update',

  // Listable
  CRM_CONTACT_LIST = 'crm.contact.list',
  CRM_DEAL_LIST = 'crm.deal.list',
  CRM_LEAD_LIST = 'crm.lead.list',
  CRM_STATUS_LIST = 'crm.status.list'
}

const LISTABLE_METHODS = [
  Method.CRM_CONTACT_LIST,
  Method.CRM_DEAL_LIST,
  Method.CRM_LEAD_LIST
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
  readonly order?: { readonly [key: string]: string } // 'ASC' | 'DESC'
  readonly filter?: { readonly [key: string]: number }
  readonly select?: ReadonlyArray<string>
}

/**
 * A mega map of all supported Bitrix methods to their parameters. Used to resolve
 * low-level client method required params and payload types.
 * - `type` — a type that method associated with
 * - `payload` — a payload that method returns
 * - `params` — params that method accepts
 */
export interface Methods extends MethodsMap, ContactsMethods, DealsMethods, LeadsMethods, StatusesMethods {

  readonly [Method.BATCH]: {
    readonly type: unknown
    readonly payload: BatchPayload<unknown>
    readonly params: Commands
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
