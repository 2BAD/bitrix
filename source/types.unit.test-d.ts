import { describe, expectTypeOf, it } from 'vitest'
import {
  type BitrixError,
  type BulkResult,
  type Contact,
  createClient,
  type Deal,
  type Envelope,
  type PaginateProgress,
  type Product,
  type User
} from './index.js'

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

  it('narrows rows to the selected fields', async () => {
    const picked = await client.deals.list({ select: ['ID', 'TITLE', 'UF_CRM_1'] })
    expectTypeOf(picked).toEqualTypeOf<Array<Pick<Deal, 'ID' | 'TITLE' | 'UF_CRM_1'>>>()
    // @ts-expect-error STAGE_ID was not selected
    void picked[0]?.STAGE_ID

    const standard = await client.deals.list()
    expectTypeOf(standard[0]?.STAGE_ID).toEqualTypeOf<string | undefined>()
    // @ts-expect-error user fields need UF_* in the select
    void standard[0]?.['UF_CRM_1']

    const all = await client.contacts.list({ select: ['*', 'UF_*', 'PHONE'] })
    expectTypeOf(all[0]?.['UF_CRM_1']).toEqualTypeOf<unknown>()
    expectTypeOf(all[0]?.PHONE).toEqualTypeOf<Contact['PHONE'] | undefined>()

    for await (const deal of client.deals.paginate({ select: ['ID'] })) {
      expectTypeOf(deal).toEqualTypeOf<Pick<Deal, 'ID'>>()
    }
    for await (const deal of client.deals.changedSince(new Date(), { select: ['ID', 'DATE_MODIFY'] })) {
      expectTypeOf(deal).toEqualTypeOf<Pick<Deal, 'ID' | 'DATE_MODIFY'>>()
    }

    const products = await client.products.list({ filter: { iblockId: 23 }, select: ['xmlId'] })
    expectTypeOf(products).toEqualTypeOf<Array<Pick<Product, 'xmlId' | 'id' | 'iblockId'>>>()
    const named = await client.products.list({ filter: { iblockId: 23 } })
    expectTypeOf(named).toEqualTypeOf<Array<Pick<Product, 'name' | 'id' | 'iblockId'>>>()
  })

  it('types bulk writes', () => {
    expectTypeOf(client.leads.createMany([{ TITLE: 'x' }])).resolves.toEqualTypeOf<BulkResult<number>>()
    expectTypeOf(client.leads.updateMany([{ id: 1, fields: { TITLE: 'x' } }])).resolves.toEqualTypeOf<
      BulkResult<boolean>
    >()
    expectTypeOf(client.leads.deleteMany([1, '2'])).resolves.toEqualTypeOf<BulkResult<boolean>>()
  })

  it('accepts a progress callback on every read', () => {
    const onProgress = (progress: PaginateProgress) => expectTypeOf(progress.total).toEqualTypeOf<number | undefined>()
    void client.deals.list({}, { onProgress })
    void client.deals.changedSince(new Date(), {}, { onProgress })
    void client.users.list({}, { onProgress })
    expectTypeOf(client.products.paginate({ filter: { iblockId: 23 } }, { onProgress })).toBeObject()
  })

  it('requires since for the modified mode', () => {
    expectTypeOf(client.paginate('crm.deal.list', {}, { mode: 'modified', since: '2026-01-01' })).toEqualTypeOf<
      AsyncGenerator<Deal, void, undefined>
    >()
    // @ts-expect-error since is required
    void client.paginate('crm.deal.list', {}, { mode: 'modified' })
  })
})
