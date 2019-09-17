// tslint:disable:object-literal-sort-keys

import Client from './client'
import CompaniesService from './services/companies'
import ContactsService from './services/contacts'
import DealsService from './services/deals'
import LeadsService from './services/leads'
import StatusesService from './services/statuses'

/**
 * Construct a Bitrix client with generic methods
 * @param restURI REST endpoint, like a `https://hello.bitrix24.ua/rest` or an inbound webhook endpoint,
 *                like a `https://hello.bitrix24.ua/rest/1/WEBHOOK_TOKEN`.
 * @param accessToken Bitrix application Access Token. Do not specify in case inbound webhook endpoint used.
 */
export default (restURI: string, accessToken?: string) => {
  const { call, batch, list } = Client(restURI, accessToken)

  return {
    call,
    batch,
    list,
    companies: CompaniesService({ call, list }),
    contacts: ContactsService({ call, list }),
    deals: DealsService({ call, list }),
    leads: LeadsService({ call, list }),
    statuses: StatusesService({ call })
  }
}

export * from './methods'
export * from './commands'
export * from './services/common'
export * from './services/companies/entities'
export * from './services/contacts/entities'
export * from './services/currencies/entities'
export * from './services/deals/entities'
export * from './services/leads/entities'
export * from './services/statuses/entities'
