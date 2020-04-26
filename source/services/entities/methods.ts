import { Method } from '../../methods'
import { GetPayload } from '../../payloads'
import { Entity } from './entities'

export interface EntitiesMethods {
  readonly [Method.ENTITY_ADD]: {
    readonly type: Entity
    readonly payload: GetPayload<boolean>
    readonly params: {
      readonly ENTITY: string
      readonly NAME: string
      readonly ACCESS : Record<string, any>
    }
  }
  
  readonly [Method.ENTITY_GET]: {
    readonly type: Entity
    readonly payload: GetPayload<Entity>
    readonly params: {
      readonly ENTITY: string
    }
  }

  readonly [Method.ENTITY_UPDATE]: {
    readonly type: Entity
    readonly payload: GetPayload<boolean>
    readonly params: {
      readonly ENTITY: string
      readonly NAME: string
      readonly ACCESS: Record<string, any>
      readonly ENTITY_NEW: string
    }
  }

  readonly [Method.ENTITY_DELETE]: {
    readonly type: Entity
    readonly payload: GetPayload<boolean>
    readonly params: {
      readonly ENTITY: string
    }
  }

  readonly [Method.ENTITY_ITEM_PROPERTY_ADD]: {
    readonly type: Entity
    readonly payload: GetPayload<boolean>
    readonly params: {
      readonly ENTITY: string
      readonly PROPERTY: string
      readonly NAME: string
      readonly TYPE : 'S' | 'N' | 'F'
    }
  }
}
