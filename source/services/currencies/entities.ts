import { BoolString, ISODate, NumberString } from '../common'

export interface Currency {
  readonly CURRENCY: string
  readonly AMOUNT_CNT: NumberString
  readonly AMOUNT: NumberString
  readonly SORT: NumberString
  readonly BASE: BoolString
  readonly FULL_NAME: string
  readonly LID: string
  readonly FORMAT_STRING: string
  readonly DEC_POINT: string
  readonly THOUSANDS_SEP: string
  readonly DECIMALS: NumberString
  readonly DATE_UPDATE: ISODate
}
