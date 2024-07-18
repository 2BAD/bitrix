import { ExtendOptions } from 'got'
import Client from './client/index.js'
import CompaniesService from './services/companies/index.js'
import ContactsService from './services/contacts/index.js'
import DealsService from './services/deals/index.js'
import LeadsService from './services/leads/index.js'
import StatusesService from './services/statuses/index.js'
import UsersService from './services/users/index.js'

/**
 * Construct a Bitrix client with generic methods
 * @param restURI REST endpoint, like a `https://hello.bitrix24.ua/rest` or an inbound webhook endpoint,
 *                like a `https://hello.bitrix24.ua/rest/1/WEBHOOK_TOKEN`.
 * @param accessToken Bitrix application Access Token. Do not specify in case inbound webhook endpoint used.
 * @param clientOptions an object that will overwrite underlying configuration for HTTP client,
 *                see `https://github.com/sindresorhus/got/blob/main/documentation/2-options.md`.
 */
export const Bitrix = (restURI: string, accessToken?: string, clientOptions?: ExtendOptions) => {
  const { call, batch, list } = Client(restURI, accessToken, clientOptions)

  return {
    call,
    batch,
    list,
    companies: CompaniesService({ call, list }),
    contacts: ContactsService({ call, list }),
    deals: DealsService({ call, list }),
    leads: LeadsService({ call, list }),
    statuses: StatusesService({ call }),
    users: UsersService({ call })
  }
}

export default Bitrix

export * from './methods.js'
export * from './commands.js'
export * from './services/common.js'
export * from './services/companies/entities.js'
export * from './services/contacts/entities.js'
export * from './services/currencies/entities.js'
export * from './services/deals/entities.js'
export * from './services/leads/entities.js'
export * from './services/statuses/entities.js'
export * from './services/users/entities.js'
