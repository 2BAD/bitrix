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
    statuses: StatusesService({ call }),
    users: UsersService({ call, list })
  }
}

export * from './method.types'
export * from './command.types'
export * from './entities/common'
export * from './services/contacts/entities'
export * from './entities/currency'
export * from './services/deals/entities'
export * from './services/leads/entities'
export * from './services/statuses/entities'
export * from './entities/user'
