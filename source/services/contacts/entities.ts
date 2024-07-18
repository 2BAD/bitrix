import { BoolString, ISODate, MultiFieldArray, NumberString } from '../common.js'

export type Contact = {
  readonly [key: string]: MultiFieldArray | string | null
  readonly ID: NumberString
  readonly POST: string | null
  readonly COMMENTS: string | null
  readonly HONORIFIC: string | null
  readonly NAME: string | null
  readonly SECOND_NAME: string | null
  readonly LAST_NAME: string | null
  readonly PHOTO: string | null
  readonly LEAD_ID: NumberString
  readonly TYPE_ID: string | null
  readonly SOURCE_ID: NumberString
  readonly SOURCE_DESCRIPTION: string | null
  readonly COMPANY_ID: NumberString
  readonly BIRTHDATE: ISODate
  readonly EXPORT: BoolString
  readonly HAS_PHONE: BoolString
  readonly HAS_EMAIL: BoolString
  readonly HAS_IMOL: BoolString
  readonly DATE_CREATE: ISODate
  readonly DATE_MODIFY: ISODate
  readonly ASSIGNED_BY_ID: NumberString
  readonly CREATED_BY_ID: NumberString
  readonly MODIFY_BY_ID: NumberString
  readonly OPENED: BoolString
  readonly ORIGINATOR_ID: string | null
  readonly ORIGIN_ID: NumberString
  readonly ORIGIN_VERSION: string | null
  readonly FACE_ID: string | null
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
