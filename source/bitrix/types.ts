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

// `C` stands for a map of names to structural types they will uphold in result
export interface BitrixBatchPayload<C> {
  readonly result: { readonly [P in keyof C]: C[P] },
  readonly error?: { readonly [P in keyof C]: string },
  readonly total: { readonly [P in keyof C]: number },
  readonly next?: { readonly [P in keyof C]: number }
}

export interface BitrixCommandParams {
  readonly [key: string]: string | number
}

export interface BitrixCommand {
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
