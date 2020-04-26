// tslint:disable:object-literal-sort-keys

import { Call } from '../../client/methods/call'
import { List } from '../../client/methods/list'
import { Method, MethodParams } from '../../methods'

interface Dependencies {
  readonly call: Call
  readonly list: List
}

export default ({ call }: Dependencies) => ({
  create: <D extends MethodParams<Method.ENTITY_ADD>>(params: D['params']) =>
    call(Method.ENTITY_ADD, { params }),

  get: (entity: string) =>
    call(Method.ENTITY_GET, { entity }),

  update: <D extends MethodParams<Method.ENTITY_UPDATE>>(params: D['params']) =>
    call(Method.ENTITY_UPDATE, { params }),
 
  delete: (entity: string) =>
    call(Method.ENTITY_DELETE, { entity }),

  createEntityItemProperty: <D extends MethodParams<Method.ENTITY_ITEM_PROPERTY_ADD>>(params: D['params']) =>
    call(Method.ENTITY_ITEM_PROPERTY_ADD, { params }),

})
