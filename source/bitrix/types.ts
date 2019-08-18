// @todo We'd want to have gettable and listable as separate enums,
//       since some used only inside `get` while other in `list`,
//       but we can't due too types compitability issues when `list` uses `get` internaly
export enum BitrixMethod {
  // Gettable
  BATCH = 'batch',
  GET_DEAL = 'crm.deal.get',
  GET_LEAD = 'crm.lead.get',

  // Listable
  LIST_DEALS = 'crm.deal.list',
  LIST_LEADS = 'crm.lead.list'
}

export interface BitrixGetPayload<P> {
  readonly result: P,
  readonly error?: string,
  readonly total: number,
  readonly next?: number
}

export interface BitrixBatchPayload<P extends { readonly [key: string]: any }> {
  // @todo Reading result will be hard, since we do not know did method return
  //       single item (for getters) or multiple items (for listers)
  readonly result: { readonly [key: string]: P | readonly P[] },
  readonly error?: { readonly [key: string]: string },
  readonly total: { readonly [key: string]: number },
  readonly next?: { readonly [key: string]: number }
}

export interface BitrixCommandParams {
  readonly [key: string]: string | number
}

interface BitrixCommand {
  readonly method: BitrixMethod
  readonly params?: BitrixCommandParams
}

export interface BitrixCommands {
  readonly [key: string]: BitrixCommand
}

export interface BitrixListOptions {
  readonly start?: number,
  readonly limit?: number | boolean
}
