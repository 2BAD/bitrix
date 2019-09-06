// tslint:disable:object-literal-sort-keys

import Client from './client'
import ContactsService from './services/contacts'
import DealsService from './services/deals'
import LeadsService from './services/leads'
import StatusesService from './services/statuses'
import UsersService from './services/users'

export default (restUri: string, accessToken: string) => {
  const { call, batch, list } = Client(restUri, accessToken)

  return {
    call,
    batch,
    list,
    contacts: ContactsService({ call, list }),
    deals: DealsService({ call, list }),
    leads: LeadsService({ call, list }),
    statuses: StatusesService({ call, list }),
    users: UsersService({ call, list })
  }
}

export * from './types'
export * from './client/types'
export * from './services/types/common'
export * from './services/types/contact'
export * from './services/types/currency'
export * from './services/types/deal'
export * from './services/types/lead'
export * from './services/types/status'
export * from './services/types/user'
