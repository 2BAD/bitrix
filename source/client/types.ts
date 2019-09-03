import { Diff } from '../utils/Diff'

export enum Method {
  // Gettable
  BATCH = 'batch',
  GET_DEAL = 'crm.deal.get',
  GET_LEAD = 'crm.lead.get',
  GET_STATUS = 'crm.status.get',
  CREATE_DEAL = 'crm.deal.add',
  CREATE_LEAD = 'crm.lead.add',
  CREATE_STATUS = 'crm.status.add',
  UPDATE_DEAL = 'crm.deal.update',
  UPDATE_LEAD = 'crm.lead.update',
  UPDATE_STATUS = 'crm.status.update',

  // Listable
  LIST_DEALS = 'crm.deal.list',
  LIST_LEADS = 'crm.lead.list',
  LIST_STATUSES = 'crm.status.list'
}

const LISTABLE_METHODS = [
  Method.LIST_DEALS,
  Method.LIST_LEADS,
  Method.LIST_STATUSES
] as const

export type ListableMethod = typeof LISTABLE_METHODS[number]
export type GettableMethod = Diff<Method, ListableMethod>

export interface PayloadTime {
  readonly start: number
  readonly finish: number
  readonly duration: number
  readonly processing: number
  readonly date_start: string
  readonly date_finish: string
}

export interface GetPayload<P> {
  readonly result: P,
  readonly time: PayloadTime
}

export interface ListPayload<P> {
  readonly result: readonly P[],
  readonly error?: string,
  readonly total: number,
  readonly next?: number
  readonly time: PayloadTime
}

// `C` stands for a map of names to structural types they will uphold in result
// `[]` in language of ill Bitrix means `undefined`. Just deal with it.
// Also, it will return object if command names specified and array if names are numbers. Deal with it.
export interface BatchPayload<C> {
  readonly result: {
    readonly result: { readonly [P in keyof C]?: C[P] } | ReadonlyArray<C[keyof C]>
    readonly result_error: { readonly [P in keyof C]?: string } | readonly string[]
    readonly result_total: { readonly [P in keyof C]?: number } | readonly number[]
    readonly result_next: { readonly [P in keyof C]?: number } | readonly number[]
    readonly result_time: { readonly [P in keyof C]?: PayloadTime } | readonly PayloadTime[]
  }
  readonly time: PayloadTime
}

export interface CreateParams {
  readonly fields: Record<string, any>
  readonly params?: {
    // Note that it doesn't work for some methods
    readonly REGISTER_SONET_EVENT: 'Y' | 'N'
  }
}

// @todo Figure out full list of possible values
export interface ListParams {
  readonly start?: number
  readonly order?: { readonly [key: string]: 'ASC' }
  readonly filter?: { readonly '>PROBABILITY': number }
  readonly select?: ReadonlyArray<'*' | 'UF_*' | string>
}

export interface GetParams {
  readonly id: string
}

export interface UpdateParams {
  readonly id: string
  readonly fields: Record<string, any>
  readonly params?: {
    // Note that it doesn't work for some methods
    readonly REGISTER_SONET_EVENT: 'Y' | 'N'
  }
}

export interface Command {
  readonly method: Method
  readonly params?: CreateParams | GetParams | ListParams | UpdateParams
}

export type Commands =
  { readonly [key: string]: Command } |
  // For arrays. It's signature, since `Command[]` won't be
  // accepted by types like `Record`
  { readonly [index: number]: Command }
