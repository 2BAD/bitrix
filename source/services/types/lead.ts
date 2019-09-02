import { BoolString, ISODate, NumberString } from './common'

// @todo This is approximate structure. Might not be accurate
export interface Lead {
  // Deal can have user fields
  // @todo Remove `unknown` when all fields will be known
  readonly [key: string]: string | unknown

  // tslint:disable-next-line: no-mixed-interface
  readonly ID: NumberString
  readonly TITLE: string
  readonly HONORIFIC: unknown | null // @todo
  readonly NAME: string | null
  readonly SECOND_NAME: string | null
  readonly LAST_NAME: string | null
  readonly COMPANY_TITLE: string | null
  readonly COMPANY_ID: unknown | null // @todo
  readonly CONTACT_ID: unknown | null // @todo
  readonly IS_RETURN_CUSTOMER: BoolString
  readonly BIRTHDATE: unknown | null // @todo
  readonly SOURCE_ID: NumberString
  readonly SOURCE_DESCRIPTION: null
  readonly STATUS_ID: unknown | null // @todo
  readonly STATUS_DESCRIPTION: string | null
  readonly POST: unknown | null // @todo
  readonly COMMENTS: string | null
  readonly CURRENCY_ID: string
  readonly OPPORTUNITY: NumberString
  readonly HAS_PHONE: BoolString
  readonly HAS_EMAIL: BoolString
  readonly HAS_IMOL: BoolString
  readonly ASSIGNED_BY_ID: NumberString
  readonly CREATED_BY_ID: NumberString
  readonly MODIFY_BY_ID: NumberString
  readonly DATE_CREATE: ISODate
  readonly DATE_MODIFY: ISODate
  readonly DATE_CLOSED: ISODate
  readonly STATUS_SEMANTIC_ID: string
  readonly OPENED: BoolString
  readonly ORIGINATOR_ID: unknown | null // @todo
  readonly ORIGIN_ID: unknown | null // @todo
  readonly ADDRESS: string | null
  readonly ADDRESS_2: string | null
  readonly ADDRESS_CITY: string | null
  readonly ADDRESS_POSTAL_CODE: string | null
  readonly ADDRESS_REGION: string | null
  readonly ADDRESS_PROVINCE: string | null
  readonly ADDRESS_COUNTRY: string | null
  readonly ADDRESS_COUNTRY_CODE: string | null
  readonly UTM_SOURCE: string | null
  readonly UTM_MEDIUM: string | null
  readonly UTM_CAMPAIGN: string | null
  readonly UTM_CONTENT: string | null
  readonly UTM_TERM: string | null
}
