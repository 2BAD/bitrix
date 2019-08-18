import client from './client'
import { BitrixListOptions, BitrixMethod } from './types'

// @todo Make it
interface BitrixDeal { readonly dealData1: string, readonly dealData2: number }
// @todo Make it
interface BitrixLead { readonly leadData1: string, readonly leadData2: number }
// @todo Make it
// interface BitrixInvoice { readonly [key: string]: any }

export default (restUri: string, token: string) => {
  const api = client(restUri, token)

  return {
    deals: {
      get: () => api.get<BitrixDeal>(BitrixMethod.GET_DEAL, {}),
      list: (options?: BitrixListOptions) => api.list<BitrixDeal>(BitrixMethod.LIST_DEALS, options)
    },
    leads: {
      // create: () => 'hello',
      get: () => api.get<BitrixLead>(BitrixMethod.GET_DEAL, {}),
      list: (options?: BitrixListOptions) => api.list<BitrixLead>(BitrixMethod.LIST_LEADS, options)
    }
    // invoice: {
    //   get: () => api.get<BitrixInvoice>('crm.invoice.list', {})
    // }
  }
}
