import { Commands } from './commands.js'
import { BatchPayload } from './payloads.js'
import { CompaniesMethods } from './services/companies/methods.js'
import { ContactsMethods } from './services/contacts/methods.js'
import { DealsMethods } from './services/deals/methods.js'
import { LeadsMethods } from './services/leads/methods.js'
import { StatusesMethods } from './services/statuses/methods.js'
import { UsersMethods } from './services/users/methods.js'
import { Diff } from './utils/Diff.js'
import { ExtractValue } from './utils/ExtractValue.js'

export enum Method {
  BATCH = 'batch',

  CRM_COMPANY_FIELDS = 'crm.company.fields',
  CRM_COMPANY_ADD = 'crm.company.add',
  CRM_COMPANY_UPDATE = 'crm.company.update',
  CRM_COMPANY_GET = 'crm.company.get',
  CRM_COMPANY_LIST = 'crm.company.list',

  CRM_CONTACT_FIELDS = 'crm.contact.fields',
  CRM_CONTACT_ADD = 'crm.contact.add',
  CRM_CONTACT_UPDATE = 'crm.contact.update',
  CRM_CONTACT_GET = 'crm.contact.get',
  CRM_CONTACT_LIST = 'crm.contact.list',

  CRM_DEAL_FIELDS = 'crm.deal.fields',
  CRM_DEAL_ADD = 'crm.deal.add',
  CRM_DEAL_UPDATE = 'crm.deal.update',
  CRM_DEAL_GET = 'crm.deal.get',
  CRM_DEAL_LIST = 'crm.deal.list',

  CRM_LEAD_FIELDS = 'crm.lead.fields',
  CRM_LEAD_ADD = 'crm.lead.add',
  CRM_LEAD_UPDATE = 'crm.lead.update',
  CRM_LEAD_GET = 'crm.lead.get',
  CRM_LEAD_LIST = 'crm.lead.list',

  CRM_STATUS_FIELDS = 'crm.status.fields',
  CRM_STATUS_ADD = 'crm.status.add',
  CRM_STATUS_DELETE = 'crm.status.delete',
  CRM_STATUS_GET = 'crm.status.get',
  CRM_STATUS_LIST = 'crm.status.list',
  CRM_STATUS_UPDATE = 'crm.status.update',

  USER_FIELDS = 'user.fields',
  USER_GET = 'user.get'
}

const LISTABLE_METHODS = [
  Method.CRM_COMPANY_LIST,
  Method.CRM_CONTACT_LIST,
  Method.CRM_DEAL_LIST,
  Method.CRM_LEAD_LIST
] as const

export type ListableMethod = typeof LISTABLE_METHODS[number]
export type GettableMethod = Diff<Method, ListableMethod>

type MethodsMap = {
  readonly [key: string]: {
    readonly type: unknown
    readonly payload: unknown
    readonly params: Record<string, unknown>
  }
}

// @todo Figure out full list of possible values
export type ListParams = {
  readonly start?: number
  readonly order?: { readonly [key: string]: string } // 'ASC' | 'DESC'
  readonly filter?: { readonly [key: string]: string | number }
  readonly select?: readonly string[]
}

/**
 * A mega map of all supported Bitrix methods to their parameters. Used to resolve
 * low-level client method required params and payload types.
 * - `type` — a type that method associated with
 * - `payload` — a payload that method returns
 * - `params` — params that method accepts
 */
export type Methods = MethodsMap & CompaniesMethods & ContactsMethods & DealsMethods & LeadsMethods & StatusesMethods & UsersMethods & {

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
