import { BoolString, ISODate, MultiField, NumberString } from '../common'

export type Company = {
  readonly [key: string]: string | boolean | null | readonly MultiField[]
  readonly ID: NumberString
  readonly COMPANY_TYPE: string | null
  readonly TITLE: string | null
  readonly LOGO: string | null
  readonly LEAD_ID: NumberString
  readonly HAS_PHONE: BoolString
  readonly HAS_EMAIL: BoolString
  readonly HAS_IMOL: BoolString
  readonly PHONE: readonly MultiField[]
  readonly EMAIL: readonly MultiField[]
  readonly WEB: readonly MultiField[]
  readonly IM: readonly MultiField[]
  readonly ASSIGNED_BY_ID: NumberString
  readonly CREATED_BY_ID: NumberString
  readonly MODIFY_BY_ID: NumberString
  readonly BANKING_DETAILS: string | null
  readonly INDUSTRY: string | null
  readonly REVENUE: string | null
  readonly CURRENCY_ID: string | null
  readonly EMPLOYEES: string | null
  readonly COMMENTS: string | null
  readonly DATE_CREATE: ISODate
  readonly DATE_MODIFY: ISODate
  readonly OPENED: BoolString
  readonly IS_MY_COMPANY: BoolString
  readonly ORIGINATOR_ID: string | null
  readonly ORIGIN_ID: NumberString
  readonly ORIGIN_VERSION: string | null
  readonly ADDRESS: string | null
  readonly ADDRESS_2: string | null
  readonly ADDRESS_CITY: string | null
  readonly ADDRESS_POSTAL_CODE: string | null
  readonly ADDRESS_REGION: string | null
  readonly ADDRESS_PROVINCE: string | null
  readonly ADDRESS_COUNTRY: string | null
  readonly ADDRESS_COUNTRY_CODE: string | null
  readonly ADDRESS_LEGAL: string | null
  readonly REG_ADDRESS: string | null
  readonly REG_ADDRESS_2: string | null
  readonly REG_ADDRESS_CITY: string | null
  readonly REG_ADDRESS_POSTAL_CODE: string | null
  readonly REG_ADDRESS_REGION: string | null
  readonly REG_ADDRESS_PROVINCE: string | null
  readonly REG_ADDRESS_COUNTRY: string | null
  readonly REG_ADDRESS_COUNTRY_CODE: string | null
  readonly UTM_SOURCE: string | null
  readonly UTM_MEDIUM: string | null
  readonly UTM_CAMPAIGN: string | null
  readonly UTM_CONTENT: string | null
  readonly UTM_TERM: string | null
}
