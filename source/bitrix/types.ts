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

export interface BitrixPayloadTime {
  readonly start: number
  readonly finish: number
  readonly duration: number
  readonly processing: number
  readonly date_start: string
  readonly date_finish: string
}

export interface BitrixGetPayload<P> {
  readonly result: P,
  readonly time: BitrixPayloadTime
}

export interface BitrixListPayload<P> {
  readonly result: readonly P[],
  readonly error?: string,
  readonly total: number,
  readonly next?: number
  readonly time: BitrixPayloadTime
}

// `C` stands for a map of names to structural types they will uphold in result
// `[]` in language of ill Bitrix means `undefined`. Just deal with it.
export interface BitrixBatchPayload<C> {
  readonly result: {
    readonly result: { readonly [P in keyof C]?: C[P] } | readonly []
    readonly result_error: { readonly [P in keyof C]?: string } | readonly []
    readonly result_total: { readonly [P in keyof C]?: number } | readonly []
    readonly result_next: { readonly [P in keyof C]?: number } | readonly []
    readonly result_time: { readonly [P in keyof C]?: BitrixPayloadTime } | readonly []
  }
  readonly time: BitrixPayloadTime
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
  readonly start?: number
}
