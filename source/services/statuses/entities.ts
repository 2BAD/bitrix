import { BoolString, NumberString } from '../common'

export interface Extra {
  readonly SEMANTICS: string
  readonly COLOR: string
}

export interface Status {
  readonly [key: string]: string | Extra | undefined
  readonly ID: NumberString
  readonly ENTITY_ID: string
  readonly STATUS_ID: NumberString
  readonly NAME: string
  readonly NAME_INIT: string
  readonly SORT: NumberString
  readonly SYSTEM: BoolString
  readonly EXTRA: Extra | undefined
}
