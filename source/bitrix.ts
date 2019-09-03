// tslint:disable:object-literal-sort-keys

import Client from './client'
import ContactsService from './services/contacts'
import DealsService from './services/deals'
import LeadsService from './services/leads'
import StatusesService from './services/statuses'

export default (restUri: string, accessToken: string) => {
  const { get, getList, batch, list } = Client(restUri, accessToken)

  return {
    get,
    getList,
    batch,
    list,
    contacts: ContactsService({ get, list }),
    deals: DealsService({ get, list }),
    leads: LeadsService({ get, list }),
    statuses: StatusesService({ get, list })
  }
}
