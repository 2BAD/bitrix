import type { Core } from '../client.js'
import type { Params } from '../methods.js'

/**
 * Currencies are identified by their code like `USD`, and `crm.currency.list` returns every currency at once
 * @param core client methods the service is built on
 * @param core.call calls a single REST method
 */
export const createCurrenciesService = ({ call }: Core) => ({
  fields: () => call('crm.currency.fields'),
  get: (id: string) => call('crm.currency.get', { id }),
  list: (params: Params<'crm.currency.list'> = {}) => call('crm.currency.list', params),
  create: (fields: Params<'crm.currency.add'>['fields']) => call('crm.currency.add', { fields }),
  update: (id: string, fields: Params<'crm.currency.update'>['fields']) => call('crm.currency.update', { id, fields }),
  delete: (id: string) => call('crm.currency.delete', { id }),
  base: () => call('crm.currency.base.get'),
  setBase: (id: string) => call('crm.currency.base.set', { id })
})
