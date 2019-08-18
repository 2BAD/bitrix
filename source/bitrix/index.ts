import bitrixClient from './client'
import { BitrixListOptions, BitrixMethod } from './types'

// @todo Make it
interface BitrixDeal { readonly dealData1: string, readonly dealData2: number }
// @todo Make it
interface BitrixLead { readonly leadData1: string, readonly leadData2: number }
// @todo Make it
// interface BitrixInvoice { readonly [key: string]: any }

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
