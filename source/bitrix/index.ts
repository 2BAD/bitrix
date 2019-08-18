// tslint:disable:object-literal-sort-keys

import bitrixClient from './client'
import { BitrixDeal, BitrixLead, BitrixListOptions, BitrixMethod } from './types'

export default (restUri: string, token: string) => {
  const { get, batch, list } = bitrixClient(restUri, token)

  return {
    get,
    batch,
    deals: {
      get: () => get<BitrixDeal>(BitrixMethod.GET_DEAL, {}),
      list: (options?: BitrixListOptions) => list<BitrixDeal>(BitrixMethod.LIST_DEALS, options)
    },
    leads: {
      // create: () => 'hello',
      get: () => get<BitrixLead>(BitrixMethod.GET_DEAL, {}),
      list: (options?: BitrixListOptions) => list<BitrixLead>(BitrixMethod.LIST_LEADS, options)
    }
    // invoice: {
    //   get: () => get<BitrixInvoice>('crm.invoice.list', {})
    // }
  }
}
