import { GenderString, ISODate, NumberString } from '../common'

export interface User {
  readonly ID: NumberString
  readonly ACTIVE: boolean
  readonly EMAIL: string | null
  readonly NAME: string | null
  readonly LAST_NAME: string | null
  readonly SECOND_NAME: string | null
  readonly PERSONAL_GENDER: GenderString
  readonly PERSONAL_PROFESSION: string | null
  readonly PERSONAL_WWW: string | null
  readonly PERSONAL_BIRTHDAY: ISODate
  readonly PERSONAL_PHOTO: string | null
  readonly PERSONAL_ICQ: string | null
  readonly PERSONAL_PHONE: string | null
  readonly PERSONAL_FAX: string | null
  readonly PERSONAL_MOBILE: string | null
  readonly PERSONAL_PAGER: string | null
  readonly PERSONAL_STREET: string | null
  readonly PERSONAL_CITY: string | null
  readonly PERSONAL_STATE: string | null
  readonly PERSONAL_ZIP: string | null
  readonly PERSONAL_COUNTRY: string | null
  readonly WORK_COMPANY: string | null
  readonly WORK_POSITION: string | null
  readonly WORK_PHONE: string | null
  readonly UF_DEPARTMENT: ReadonlyArray<number>
  readonly UF_INTERESTS: string | null
  readonly UF_SKILLS: string | null
  readonly UF_WEB_SITES: string | null
  readonly UF_XING: string | null
  readonly UF_LINKEDIN: string | null
  readonly UF_FACEBOOK: string | null
  readonly UF_TWITTER: string | null
  readonly UF_SKYPE: string | null
  readonly UF_DISTRICT: string | null
  readonly UF_PHONE_INNER: NumberString | null
  readonly USER_TYPE: 'employee'
}
