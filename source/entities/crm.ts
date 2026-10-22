// Bitrix sends integers and decimals of CRM entities as strings, like `'20.23'`
export type NumberString = string
// Like `'2018-06-07T03:00:00+03:00'`
export type ISODate = string
export type BoolString = 'Y' | 'N'

export type Id = number | string

export type Field = {
  readonly type: string
  readonly isRequired: boolean
  readonly isReadOnly: boolean
  readonly isImmutable: boolean
  readonly isMultiple: boolean
  readonly isDynamic: boolean
  readonly title: string
  readonly listLabel?: string
  readonly formLabel?: string
  readonly filterLabel?: string
  readonly statusType?: string
  readonly items?: ReadonlyArray<{ readonly ID: string; readonly VALUE: string }>
}

export type Fields = Readonly<Record<string, Field>>

export type MultiField = {
  readonly ID: NumberString
  readonly VALUE_TYPE: string
  readonly VALUE: string
  readonly TYPE_ID: string
}

export type MultiFieldInput = {
  readonly ID?: Id
  readonly VALUE: string
  readonly VALUE_TYPE?: string
  readonly DELETE?: BoolString
}

type UserFields = {
  readonly [field: `UF_${string}`]: unknown
}

/**
 * Typed user fields of each CRM entity, empty until augmented. `bitrix-types` generates the augmentation
 * from a portal:
 * ```ts
 * declare module '@2bad/bitrix' {
 *   interface DealUserFields {
 *     readonly UF_CRM_1568211173: '45' | '47' | null
 *   }
 * }
 * ```
 */
// oxlint-disable-next-line typescript/no-empty-object-type
export interface DealUserFields {}
// oxlint-disable-next-line typescript/no-empty-object-type
export interface LeadUserFields {}
// oxlint-disable-next-line typescript/no-empty-object-type
export interface ContactUserFields {}
// oxlint-disable-next-line typescript/no-empty-object-type
export interface CompanyUserFields {}

/**
 * Value of a file user field
 */
export type UserFieldFile = {
  readonly id: number
  readonly showUrl: string
  readonly downloadUrl: string
}

/**
 * Accepted for a file user field on create and update: a new file as its name and base64 content,
 * or an existing file by id
 */
export type UserFieldFileInput =
  | { readonly fileData: readonly [name: string, base64: string] }
  | { readonly id: number }

type Utm = {
  readonly UTM_SOURCE: string | null
  readonly UTM_MEDIUM: string | null
  readonly UTM_CAMPAIGN: string | null
  readonly UTM_CONTENT: string | null
  readonly UTM_TERM: string | null
}

type Address<P extends string> = {
  readonly [
    K in `${P}ADDRESS${'' | '_2' | '_CITY' | '_POSTAL_CODE' | '_REGION' | '_PROVINCE' | '_COUNTRY' | '_COUNTRY_CODE' | '_LOC_ADDR_ID'}`
  ]: string | null
}

type Communications = {
  readonly HAS_PHONE: BoolString
  readonly HAS_EMAIL: BoolString
  readonly HAS_IMOL: BoolString
  readonly PHONE?: readonly MultiField[]
  readonly EMAIL?: readonly MultiField[]
  readonly WEB?: readonly MultiField[]
  readonly IM?: readonly MultiField[]
  readonly LINK?: readonly MultiField[]
}

type Tracking = {
  readonly ASSIGNED_BY_ID: NumberString | null
  readonly CREATED_BY_ID: NumberString
  readonly MODIFY_BY_ID: NumberString | null
  readonly DATE_CREATE: ISODate
  readonly DATE_MODIFY: ISODate
  readonly OPENED: BoolString
  readonly ORIGINATOR_ID: string | null
  readonly ORIGIN_ID: string | null
  readonly LAST_ACTIVITY_TIME: ISODate | null
  readonly LAST_ACTIVITY_BY: NumberString | null
  readonly LAST_COMMUNICATION_TIME: string | null
}

export type Deal = DealUserFields &
  UserFields &
  Utm &
  Tracking & {
    readonly ID: NumberString
    readonly TITLE: string | null
    readonly TYPE_ID: string | null
    readonly CATEGORY_ID: NumberString
    readonly STAGE_ID: string
    readonly PREVIOUS_STAGE_ID?: string | null
    readonly STAGE_SEMANTIC_ID: string
    readonly IS_NEW: BoolString
    readonly IS_RECURRING: BoolString
    readonly IS_RETURN_CUSTOMER: BoolString
    readonly IS_REPEATED_APPROACH: BoolString
    readonly PROBABILITY: NumberString | null
    readonly CURRENCY_ID: string
    readonly OPPORTUNITY: NumberString
    readonly IS_MANUAL_OPPORTUNITY: BoolString
    readonly TAX_VALUE: NumberString | null
    readonly COMPANY_ID: NumberString
    readonly MYCOMPANY_ID?: NumberString | null
    readonly CONTACT_ID: NumberString | null
    readonly CONTACT_IDS?: readonly NumberString[]
    readonly QUOTE_ID: NumberString | null
    readonly BEGINDATE: ISODate
    readonly CLOSEDATE: ISODate
    readonly CLOSED: BoolString
    readonly COMMENTS: string | null
    readonly MOVED_BY_ID: NumberString | null
    readonly MOVED_TIME: ISODate | null
    readonly SOURCE_ID: string | null
    readonly SOURCE_DESCRIPTION: string | null
    readonly LEAD_ID: NumberString | null
    readonly ADDITIONAL_INFO: string | null
    readonly LOCATION_ID: string | null
  }

export type Lead = LeadUserFields &
  UserFields &
  Utm &
  Tracking &
  Communications &
  Address<''> & {
    readonly ID: NumberString
    readonly TITLE: string | null
    readonly HONORIFIC: string | null
    readonly NAME: string | null
    readonly SECOND_NAME: string | null
    readonly LAST_NAME: string | null
    readonly BIRTHDATE: ISODate
    readonly COMPANY_TITLE: string | null
    readonly SOURCE_ID: string | null
    readonly SOURCE_DESCRIPTION: string | null
    readonly STATUS_ID: string
    readonly STATUS_DESCRIPTION: string | null
    readonly STATUS_SEMANTIC_ID: string
    readonly POST: string | null
    readonly CURRENCY_ID: string
    readonly OPPORTUNITY: NumberString
    readonly IS_MANUAL_OPPORTUNITY: BoolString
    readonly COMMENTS: string | null
    readonly MOVED_BY_ID: NumberString | null
    readonly MOVED_TIME: ISODate | null
    readonly COMPANY_ID: NumberString | null
    readonly CONTACT_ID: NumberString | null
    readonly CONTACT_IDS?: readonly NumberString[]
    readonly IS_RETURN_CUSTOMER: BoolString
    readonly DATE_CLOSED: ISODate
  }

export type Contact = ContactUserFields &
  UserFields &
  Utm &
  Tracking &
  Communications &
  Address<''> & {
    readonly ID: NumberString
    readonly HONORIFIC: string | null
    readonly NAME: string | null
    readonly SECOND_NAME: string | null
    readonly LAST_NAME: string | null
    readonly PHOTO: unknown
    readonly BIRTHDATE: ISODate
    readonly TYPE_ID: string | null
    readonly SOURCE_ID: string | null
    readonly SOURCE_DESCRIPTION: string | null
    readonly POST: string | null
    readonly COMMENTS: string | null
    readonly EXPORT: BoolString
    readonly COMPANY_ID: NumberString | null
    readonly COMPANY_IDS?: readonly NumberString[]
    readonly LEAD_ID: NumberString | null
    readonly ORIGIN_VERSION: string | null
  }

export type Company = CompanyUserFields &
  UserFields &
  Utm &
  Tracking &
  Communications &
  Address<''> &
  Address<'REG_'> & {
    readonly ID: NumberString
    readonly TITLE: string
    readonly COMPANY_TYPE: string | null
    readonly LOGO: unknown
    readonly ADDRESS_LEGAL: string | null
    readonly BANKING_DETAILS: string | null
    readonly INDUSTRY: string | null
    readonly EMPLOYEES: string | null
    readonly CURRENCY_ID: string | null
    readonly REVENUE: NumberString | null
    readonly COMMENTS: string | null
    readonly IS_MY_COMPANY: BoolString
    readonly CONTACT_ID?: readonly NumberString[]
    readonly LEAD_ID: NumberString | null
    readonly ORIGIN_VERSION: string | null
  }

export type ActivityCommunication = {
  readonly ID?: NumberString
  readonly TYPE: string
  readonly VALUE: string
  readonly ENTITY_ID: Id
  readonly ENTITY_TYPE_ID: Id
}

export type Activity = {
  readonly ID: NumberString
  readonly OWNER_ID: NumberString
  readonly OWNER_TYPE_ID: NumberString
  readonly TYPE_ID: NumberString
  readonly PROVIDER_ID: string
  readonly PROVIDER_TYPE_ID: string
  readonly PROVIDER_GROUP_ID: string | null
  readonly ASSOCIATED_ENTITY_ID: NumberString
  readonly SUBJECT: string
  readonly START_TIME: ISODate | null
  readonly END_TIME: ISODate | null
  readonly DEADLINE: ISODate | null
  readonly COMPLETED: BoolString
  readonly STATUS: NumberString
  readonly RESPONSIBLE_ID: NumberString
  readonly PRIORITY: NumberString
  readonly NOTIFY_TYPE: NumberString
  readonly NOTIFY_VALUE: NumberString
  readonly DESCRIPTION: string
  readonly DESCRIPTION_TYPE: NumberString
  readonly DIRECTION: NumberString
  readonly LOCATION: string
  readonly CREATED: ISODate
  readonly AUTHOR_ID: NumberString
  readonly LAST_UPDATED: ISODate
  readonly EDITOR_ID: NumberString
  readonly SETTINGS: unknown
  readonly ORIGIN_ID: string | null
  readonly ORIGINATOR_ID: string | null
  readonly RESULT_STATUS: NumberString
  readonly RESULT_STREAM: NumberString
  readonly RESULT_SOURCE_ID: string | null
  readonly PROVIDER_PARAMS: unknown
  readonly PROVIDER_DATA: string | null
  readonly RESULT_MARK: NumberString
  readonly RESULT_VALUE: NumberString | null
  readonly RESULT_SUM: NumberString | null
  readonly RESULT_CURRENCY_ID: string | null
  readonly AUTOCOMPLETE_RULE: NumberString
  readonly BINDINGS?: ReadonlyArray<{ readonly OWNER_ID: NumberString; readonly OWNER_TYPE_ID: NumberString }>
  readonly COMMUNICATIONS?: readonly ActivityCommunication[]
  readonly FILES?: readonly unknown[]
  readonly IS_INCOMING_CHANNEL?: BoolString
}

export type Status = {
  readonly ID: NumberString
  readonly ENTITY_ID: string
  readonly STATUS_ID: string
  readonly NAME: string
  readonly NAME_INIT: string
  readonly SORT: NumberString
  readonly SYSTEM: BoolString
  readonly CATEGORY_ID: NumberString | null
  readonly COLOR: string | null
  readonly SEMANTICS: string | null
  readonly DESCRIPTION?: string | null
  readonly EXTRA?: { readonly SEMANTICS?: string; readonly COLOR?: string; readonly [key: string]: unknown }
}

export type CurrencyLocalization = {
  readonly FULL_NAME: string
  readonly FORMAT_STRING: string
  readonly DEC_POINT: string
  readonly THOUSANDS_SEP: string | null
  readonly THOUSANDS_VARIANT?: string | null
  readonly DECIMALS: NumberString
  readonly HIDE_ZERO?: BoolString
}

export type Currency = CurrencyLocalization & {
  readonly CURRENCY: string
  readonly AMOUNT_CNT: NumberString
  readonly AMOUNT: NumberString
  readonly SORT: NumberString
  readonly BASE: BoolString
  readonly LID: string
  readonly DATE_UPDATE: ISODate
  readonly LANG?: Readonly<Record<string, CurrencyLocalization>>
}

export type ProductRow = {
  readonly ID: NumberString
  readonly OWNER_ID: NumberString
  readonly OWNER_TYPE: string
  readonly PRODUCT_ID: number
  readonly PRODUCT_NAME: string
  readonly ORIGINAL_PRODUCT_NAME: string | null
  readonly PRODUCT_DESCRIPTION: string | null
  readonly PRICE: number
  readonly PRICE_EXCLUSIVE: number
  readonly PRICE_NETTO: number
  readonly PRICE_BRUTTO: number
  readonly PRICE_ACCOUNT: string
  readonly QUANTITY: number
  readonly DISCOUNT_TYPE_ID: number
  readonly DISCOUNT_RATE: number
  readonly DISCOUNT_SUM: number
  readonly TAX_RATE: number | null
  readonly TAX_NAME: string
  readonly TAX_INCLUDED: BoolString
  readonly CUSTOMIZED: BoolString
  readonly MEASURE_CODE: number
  readonly MEASURE_NAME: string
  readonly SORT: number
  readonly XML_ID: string
  readonly TYPE: number
  readonly STORE_ID: number | null
  readonly RESERVE_ID: number | null
  readonly DATE_RESERVE_END: ISODate | null
  readonly RESERVE_QUANTITY: number | null
}

/**
 * Shape accepted when creating or updating an entity: every field optional, ids as numbers or strings
 */
type Present<T> = Exclude<T, null | undefined | false>

export type Input<E> = {
  readonly [K in keyof E]?: Present<E[K]> extends readonly MultiField[]
    ? readonly MultiFieldInput[]
    : Present<E[K]> extends UserFieldFile
      ? UserFieldFileInput | null
      : Present<E[K]> extends readonly UserFieldFile[]
        ? readonly UserFieldFileInput[]
        : Present<E[K]> extends string
          ? E[K] | number
          : E[K]
}
