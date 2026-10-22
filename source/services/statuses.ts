import type { Core } from '../client.js'
import type { Id, Input, Status } from '../entities/crm.js'
import type { Params } from '../methods.js'

/**
 * `crm.status.list` returns every status at once, so there is no pagination here
 * @param core client methods the service is built on
 * @param core.call calls a single REST method
 */
export const createStatusesService = ({ call }: Core) => ({
  fields: () => call('crm.status.fields'),
  get: (id: Id) => call('crm.status.get', { id }),
  list: (params: Params<'crm.status.list'> = {}) => call('crm.status.list', params),
  create: (fields: Input<Status>) => call('crm.status.add', { fields }),
  update: (id: Id, fields: Input<Status>) => call('crm.status.update', { id, fields }),
  delete: (id: Id, { forced = false }: { readonly forced?: boolean } = {}) =>
    call('crm.status.delete', { id, params: { FORCED: forced ? 'Y' : 'N' } })
})
