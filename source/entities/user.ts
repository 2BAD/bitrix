import type { ISODate, NumberString } from './crm.js'

/**
 * `user.get` leaves out fields that are empty, so everything except the id is optional
 */
export type User = {
  readonly [field: `UF_${string}`]: unknown
  readonly ID: NumberString
  readonly XML_ID?: string
  readonly ACTIVE?: boolean
  readonly NAME?: string
  readonly LAST_NAME?: string
  readonly SECOND_NAME?: string
  readonly TITLE?: string
  readonly EMAIL?: string
  readonly LAST_LOGIN?: ISODate
  readonly DATE_REGISTER?: ISODate
  readonly TIME_ZONE?: string
  readonly IS_ONLINE?: 'Y' | 'N'
  readonly TIMESTAMP_X?: unknown
  readonly LAST_ACTIVITY_DATE?: unknown
  readonly PERSONAL_GENDER?: 'M' | 'F' | ''
  readonly PERSONAL_PROFESSION?: string
  readonly PERSONAL_WWW?: string
  readonly PERSONAL_BIRTHDAY?: ISODate
  readonly PERSONAL_PHOTO?: string
  readonly PERSONAL_ICQ?: string
  readonly PERSONAL_PHONE?: string
  readonly PERSONAL_FAX?: string
  readonly PERSONAL_MOBILE?: string
  readonly PERSONAL_PAGER?: string
  readonly PERSONAL_STREET?: string
  readonly PERSONAL_MAILBOX?: string
  readonly PERSONAL_CITY?: string
  readonly PERSONAL_STATE?: string
  readonly PERSONAL_ZIP?: string
  readonly PERSONAL_COUNTRY?: string
  readonly PERSONAL_NOTES?: string
  readonly WORK_COMPANY?: string
  readonly WORK_POSITION?: string
  readonly WORK_PHONE?: string
  readonly WORK_DEPARTMENT?: string
  readonly WORK_WWW?: string
  readonly WORK_FAX?: string
  readonly WORK_PAGER?: string
  readonly WORK_STREET?: string
  readonly WORK_MAILBOX?: string
  readonly WORK_CITY?: string
  readonly WORK_STATE?: string
  readonly WORK_ZIP?: string
  readonly WORK_COUNTRY?: string
  readonly WORK_PROFILE?: string
  readonly WORK_LOGO?: string
  readonly WORK_NOTES?: string
  readonly UF_DEPARTMENT?: readonly number[]
  readonly USER_TYPE?: string
}
