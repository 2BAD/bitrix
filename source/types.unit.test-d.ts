import { describe, expectTypeOf, it } from 'vitest'
import { type BitrixError, createClient, type Deal, type Envelope, type Product, type User } from './index.js'

declare module './index.js' {
  interface Methods {
    'tasks.task.get': { params: { readonly taskId: number }; result: { task: { id: string } } }
  }
}

const client = createClient({ url: 'https://portal.bitrix24.com/rest/1/token' })

describe('types', () => {
  it('infers params and results of known methods', () => {
    expectTypeOf(client.call('crm.deal.get', { id: 1 })).resolves.toEqualTypeOf<Deal>()
    expectTypeOf(client.call('crm.deal.add', { fields: { TITLE: 'x', ASSIGNED_BY_ID: 1 } })).resolves.toBeNumber()
    expectTypeOf(client.call('crm.deal.fields')).resolves.toHaveProperty('ID')
    // @ts-expect-error id is required
    void client.call('crm.deal.get', {})
    // @ts-expect-error params are required
    void client.call('crm.deal.get')
  })

  it('returns the envelope with raw', () => {
    expectTypeOf(client.call('crm.deal.get', { id: 1 }, { raw: true })).resolves.toEqualTypeOf<Envelope<Deal>>()
  })

  it('falls back to loose types for unknown methods', () => {
    expectTypeOf(client.call('im.notify.system.add', { USER_ID: 1 })).resolves.toBeUnknown()
    expectTypeOf(client.call('some.method')).resolves.toBeUnknown()
  })

  it('picks up augmented methods', () => {
    expectTypeOf(client.call('tasks.task.get', { taskId: 1 })).resolves.toEqualTypeOf<{ task: { id: string } }>()
    // @ts-expect-error taskId must be a number
    void client.call('tasks.task.get', { taskId: '1' })
  })

  it('types list and paginate rows', () => {
    expectTypeOf(client.list('crm.deal.list')).resolves.toEqualTypeOf<Deal[]>()
    expectTypeOf(client.paginate('catalog.product.list', { filter: { iblockId: 23 } })).toEqualTypeOf<
      AsyncGenerator<Product, void, undefined>
    >()
    // @ts-expect-error unknown select field
    void client.list('crm.deal.list', { select: ['NOPE'] })
  })

  it('types batch results and errors per key', async () => {
    const { results, errors } = await client.batch({
      deal: { method: 'crm.deal.get', params: { id: 1 } },
      users: { method: 'user.get', params: {} }
    })
    expectTypeOf(results.deal).toEqualTypeOf<Deal | undefined>()
    expectTypeOf(results.users).toEqualTypeOf<User[] | undefined>()
    expectTypeOf(errors.deal).toEqualTypeOf<BitrixError | undefined>()
    // @ts-expect-error params of a known command are checked
    void client.batch({ deal: { method: 'crm.deal.get', params: { nope: 1 } } })
  })

  it('types services', () => {
    expectTypeOf(client.deals.get(1)).resolves.toEqualTypeOf<Deal>()
    expectTypeOf(client.deals.create({ TITLE: 'x' })).resolves.toBeNumber()
    expectTypeOf(client.users.get('1')).resolves.toEqualTypeOf<User>()
    expectTypeOf(client.products.get(1)).resolves.toEqualTypeOf<Product>()
    // @ts-expect-error catalog lists need an iblockId filter
    void client.products.list({ filter: {} })
  })
})
