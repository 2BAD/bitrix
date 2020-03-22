export interface PayloadTime {
  readonly start: number
  readonly finish: number
  readonly duration: number
  readonly processing: number
  readonly date_start: string
  readonly date_finish: string
}

export interface GetPayload<P> {
  readonly result: P
  readonly time: PayloadTime
}

export interface ListPayload<P> {
  readonly result: readonly P[]
  readonly error?: string
  readonly total: number
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

export type Payload<P> = GetPayload<P> | ListPayload<P> | BatchPayload<P>
