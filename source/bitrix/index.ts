// tslint:disable:object-literal-sort-keys

import prepareClient from './client'
import prepareDealsService from './services/deals'
import prepareLeadsService from './services/leads'

export default (restUri: string, token: string) => {
  const { get, batch, list } = prepareClient(restUri, token)

  return {
    get,
    batch,
    deals: prepareDealsService({ get, list }),
    leads: prepareLeadsService({ get, list })
  }
}
