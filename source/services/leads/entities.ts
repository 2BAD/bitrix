import { BoolString, ISODate, NumberString } from '../common'

export interface Lead {
  // Deal can have user fields
  readonly [key: string]: string | null

  readonly ID: NumberString
  readonly TITLE: string
  readonly HONORIFIC: string | null
  readonly NAME: string | null
  readonly SECOND_NAME: string | null
  readonly LAST_NAME: string | null
  readonly COMPANY_TITLE: string | null
  readonly COMPANY_ID: NumberString | null
  readonly CONTACT_ID: NumberString | null
  readonly IS_RETURN_CUSTOMER: BoolString
  readonly BIRTHDATE: ISODate
  readonly SOURCE_ID: NumberString
  readonly SOURCE_DESCRIPTION: string | null
  readonly STATUS_ID: string
  readonly STATUS_DESCRIPTION: string | null
  readonly POST: string | null
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
  readonly ORIGINATOR_ID: string | null
  readonly ORIGIN_ID: NumberString | null
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
