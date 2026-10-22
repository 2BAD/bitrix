import type { BoolString, ISODate } from './crm.js'

/**
 * Catalog methods use camelCase fields with native numbers. Custom properties come as `property<ID>`
 * and only the selected fields are returned
 */
export type Product = {
  readonly [field: `property${number}`]: unknown
  readonly id: number
  readonly iblockId: number
  readonly name?: string
  readonly active?: BoolString
  readonly available?: BoolString
  readonly bundle?: BoolString
  readonly code?: string | null
  readonly xmlId?: string | null
  readonly sort?: number
  readonly type?: number
  readonly iblockSectionId?: number | null
  readonly iblockSection?: readonly number[]
  readonly previewText?: string | null
  readonly previewTextType?: string
  readonly detailText?: string | null
  readonly detailTextType?: string
  readonly previewPicture?: unknown
  readonly detailPicture?: unknown
  readonly dateActiveFrom?: ISODate | null
  readonly dateActiveTo?: ISODate | null
  readonly dateCreate?: ISODate
  readonly timestampX?: ISODate
  readonly createdBy?: number
  readonly modifiedBy?: number
  readonly measure?: number
  readonly quantity?: number
  readonly purchasingPrice?: number | null
  readonly purchasingCurrency?: string | null
  readonly vatId?: number | null
  readonly vatIncluded?: BoolString
  readonly weight?: number | null
}

export type ProductField = {
  readonly name: string
  readonly type: string
  readonly isRequired: boolean
  readonly isReadOnly: boolean
  readonly isImmutable: boolean
  readonly isMultiple?: boolean
  readonly propertyType?: string
  readonly values?: unknown
}
