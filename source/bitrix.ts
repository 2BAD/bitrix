import { client } from './client'

// const MAX_ENTRIES_PER_PAGE = 50
// const MAX_PAGES_PER_BATCH = 50
// const MAX_ENTRIES_PER_BATCH = MAX_ENTRIES_PER_PAGE * MAX_PAGES_PER_BATCH

export const Bitrix = (restUri: string, token: string) => {
  const api = client(restUri, token)

  return {
    deals: {
      get: () => api.get('crm.deal.list', {})
    },
    leads: {
      create: () => 'hello',
      get: () => api.get('crm.lead.list', {})
    },
    invoice: {
      get: () => api.get('crm.invoice.list', {})
    }
  }
}
