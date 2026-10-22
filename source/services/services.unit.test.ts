import { describe, expect, it } from 'vitest'
import { fakeFetch, fakeList, type Handler, ok } from '../__fixtures__/bitrix.js'
import { createClient } from '../client.js'
import { BitrixError } from '../errors.js'
import type { CrmService } from './crm.js'

const setup = (handler: Handler = () => ok(true)) => {
  const fake = fakeFetch(handler)
  const client = createClient({
    url: 'https://portal.bitrix24.com/rest/1/token',
    fetch: fake.fetch,
    limiter: { burst: 1000 }
  })
  return { ...fake, client }
}

describe.each(['activity', 'company', 'contact', 'deal', 'lead'] as const)('crm.%s service', (name) => {
  const service = (client: ReturnType<typeof setup>['client']): CrmService<any> =>
    ({
      activity: client.activities,
      company: client.companies,
      contact: client.contacts,
      deal: client.deals,
      lead: client.leads
    })[name]

  it('gets fields', async () => {
    const { client, requests } = setup(() => ok({ ID: { type: 'integer' } }))
    await expect(service(client).fields()).resolves.toEqual({ ID: { type: 'integer' } })
    expect(requests[0]).toMatchObject({ method: `crm.${name}.fields`, body: {} })
  })

  it('gets an entity by id', async () => {
    const { client, requests } = setup(() => ok({ ID: '7' }))
    await expect(service(client).get(7)).resolves.toEqual({ ID: '7' })
    expect(requests[0]).toMatchObject({ method: `crm.${name}.get`, body: { id: 7 } })
  })

  it('creates an entity and returns its id', async () => {
    const { client, requests } = setup(() => ok(42))
    await expect(service(client).create({ ID: 1 })).resolves.toBe(42)
    expect(requests[0]).toMatchObject({ method: `crm.${name}.add`, body: { fields: { ID: 1 } } })
  })

  it('passes sonet params on create and update', async () => {
    const { client, requests } = setup()
    await service(client).create({}, { REGISTER_SONET_EVENT: 'N' })
    await service(client).update(1, {}, { REGISTER_SONET_EVENT: 'Y' })
    expect(requests.map((request) => request.body.params)).toEqual([
      { REGISTER_SONET_EVENT: 'N' },
      { REGISTER_SONET_EVENT: 'Y' }
    ])
  })

  it('updates an entity', async () => {
    const { client, requests } = setup()
    await expect(service(client).update('5', { ID: 5 })).resolves.toBe(true)
    expect(requests[0]).toMatchObject({ method: `crm.${name}.update`, body: { id: '5', fields: { ID: 5 } } })
    expect(requests[0]?.body).not.toHaveProperty('params')
  })

  it('deletes an entity', async () => {
    const { client, requests } = setup()
    await expect(service(client).delete(5)).resolves.toBe(true)
    expect(requests[0]).toMatchObject({ method: `crm.${name}.delete`, body: { id: 5 } })
  })

  it('lists and paginates every entity', async () => {
    const { rows, handler } = fakeList({ count: 75 })
    const { client, requests } = setup(handler)

    await expect(service(client).list({ select: ['ID'] })).resolves.toEqual(rows)
    const paginated = []
    for await (const row of service(client).paginate({}, { mode: 'offset' })) paginated.push(row)
    expect(paginated).toEqual(rows)
    expect(requests.every((request) => request.method === `crm.${name}.list` || request.method === 'batch')).toBe(true)
  })

  it('reads changes by modification time', async () => {
    const { client, requests } = setup(() => ok([{ ID: '1' }]))
    const since = '2026-01-01T00:00:00+03:00'
    const field = name === 'activity' ? 'LAST_UPDATED' : 'DATE_MODIFY'

    const rows = []
    for await (const row of service(client).changedSince(since, { select: ['ID'] })) rows.push(row)

    expect(rows).toEqual([{ ID: '1' }])
    expect(requests[0]).toMatchObject({
      method: `crm.${name}.list`,
      body: { select: ['ID', field], filter: { [`>=${field}`]: since }, order: { [field]: 'ASC', ID: 'ASC' } }
    })
  })

  describe('bulk writes', () => {
    const batchHandler: Handler = (_method, body) =>
      ok({
        result: Object.fromEntries(
          Object.keys(body.cmd)
            .filter((key) => key !== '1')
            .map((key) => [key, Number(key) + 100])
        ),
        result_error: { '1': { error: 'ERROR_CORE', error_description: 'bad' } },
        result_total: [],
        result_next: []
      })

    it('creates many entities in one batch', async () => {
      const { client, requests } = setup(batchHandler)
      const { results, errors } = await service(client).createMany([{ TITLE: 'a' }, { TITLE: 'b' }, { TITLE: 'c' }], {
        REGISTER_SONET_EVENT: 'N'
      })

      expect(results).toEqual([100, undefined, 102])
      expect(errors[1]).toMatchObject({ code: 'ERROR_CORE', method: `crm.${name}.add`, command: '1' })
      expect(decodeURIComponent(requests[0]?.body.cmd[0])).toBe(
        `crm.${name}.add?fields[TITLE]=a&params[REGISTER_SONET_EVENT]=N`
      )
    })

    it('updates many entities', async () => {
      const { client, requests } = setup(batchHandler)
      await service(client).updateMany([{ id: 1, fields: { TITLE: 'a' } }])
      await service(client).updateMany([{ id: 2, fields: { TITLE: 'b' } }], { REGISTER_SONET_EVENT: 'Y' })
      expect(requests.map((request) => decodeURIComponent(request.body.cmd[0]))).toEqual([
        `crm.${name}.update?id=1&fields[TITLE]=a`,
        `crm.${name}.update?id=2&fields[TITLE]=b&params[REGISTER_SONET_EVENT]=Y`
      ])
    })

    it('deletes many entities, splitting more than 50', async () => {
      const { client, requests } = setup(batchHandler)
      const ids = Array.from({ length: 60 }, (_, index) => index + 1)
      const { results } = await service(client).deleteMany(ids)
      expect(results).toHaveLength(60)
      expect(requests.map((request) => Object.keys(request.body.cmd).length)).toEqual([50, 10])
      expect(requests[0]?.body.cmd[0]).toBe(`crm.${name}.delete?id=1`)
    })

    it('creates nothing for an empty list', async () => {
      const { client, fetch } = setup(batchHandler)
      await expect(service(client).createMany([])).resolves.toEqual({ results: [], errors: [] })
      expect(fetch).not.toHaveBeenCalled()
    })
  })
})

describe.each(['deal', 'lead'] as const)('crm.%s product rows', (name) => {
  it('gets and sets product rows', async () => {
    const { client, requests } = setup(() => ok([]))
    const productRows = name === 'deal' ? client.deals.productRows : client.leads.productRows

    await productRows.get(3)
    await productRows.set(3, [{ PRODUCT_ID: 9, QUANTITY: 2 }])

    expect(requests).toMatchObject([
      { method: `crm.${name}.productrows.get`, body: { id: 3 } },
      { method: `crm.${name}.productrows.set`, body: { id: 3, rows: [{ PRODUCT_ID: 9, QUANTITY: 2 }] } }
    ])
  })
})

describe('statuses service', () => {
  it('maps every method', async () => {
    const { client, requests } = setup()
    const { statuses } = client

    await statuses.fields()
    await statuses.get(1)
    await statuses.list()
    await statuses.list({ filter: { ENTITY_ID: 'SOURCE' } })
    await statuses.create({ ENTITY_ID: 'SOURCE', STATUS_ID: 'X', NAME: 'X' })
    await statuses.update(1, { NAME: 'Y' })
    await statuses.delete(1)
    await statuses.delete(1, { forced: true })

    expect(requests.map(({ method, body }) => [method, body])).toEqual([
      ['crm.status.fields', {}],
      ['crm.status.get', { id: 1 }],
      ['crm.status.list', {}],
      ['crm.status.list', { filter: { ENTITY_ID: 'SOURCE' } }],
      ['crm.status.add', { fields: { ENTITY_ID: 'SOURCE', STATUS_ID: 'X', NAME: 'X' } }],
      ['crm.status.update', { id: 1, fields: { NAME: 'Y' } }],
      ['crm.status.delete', { id: 1, params: { FORCED: 'N' } }],
      ['crm.status.delete', { id: 1, params: { FORCED: 'Y' } }]
    ])
  })
})

describe('currencies service', () => {
  it('maps every method', async () => {
    const { client, requests } = setup()
    const { currencies } = client

    await currencies.fields()
    await currencies.get('USD')
    await currencies.list()
    await currencies.list({ order: { SORT: 'ASC' } })
    await currencies.create({ CURRENCY: 'XAU', AMOUNT_CNT: 1, AMOUNT: 2400, LANG: { en: { FULL_NAME: 'Gold' } } })
    await currencies.update('XAU', { AMOUNT: 2500 })
    await currencies.delete('XAU')
    await currencies.base()
    await currencies.setBase('EUR')

    expect(requests.map(({ method, body }) => [method, body])).toEqual([
      ['crm.currency.fields', {}],
      ['crm.currency.get', { id: 'USD' }],
      ['crm.currency.list', {}],
      ['crm.currency.list', { order: { SORT: 'ASC' } }],
      [
        'crm.currency.add',
        { fields: { CURRENCY: 'XAU', AMOUNT_CNT: 1, AMOUNT: 2400, LANG: { en: { FULL_NAME: 'Gold' } } } }
      ],
      ['crm.currency.update', { id: 'XAU', fields: { AMOUNT: 2500 } }],
      ['crm.currency.delete', { id: 'XAU' }],
      ['crm.currency.base.get', {}],
      ['crm.currency.base.set', { id: 'EUR' }]
    ])
  })
})

describe('users service', () => {
  it('gets fields and the current user', async () => {
    const { client, requests } = setup(() => ok({ ID: '1' }))
    await client.users.fields()
    await expect(client.users.current()).resolves.toEqual({ ID: '1' })
    expect(requests.map((request) => request.method)).toEqual(['user.fields', 'user.current'])
  })

  it('gets a user by id', async () => {
    const { client, requests } = setup(() => ok([{ ID: '3' }]))
    await expect(client.users.get(3)).resolves.toEqual({ ID: '3' })
    expect(requests[0]).toMatchObject({ method: 'user.get', body: { ID: 3 } })
  })

  it('throws NOT_FOUND for a missing user', async () => {
    const { client } = setup(() => ok([]))
    const error = await client.users.get(404).catch((caught: unknown) => caught)
    expect(error).toBeInstanceOf(BitrixError)
    expect(error).toMatchObject({ code: 'NOT_FOUND', method: 'user.get' })
  })

  it('lists and paginates users by offset', async () => {
    const { rows, handler } = fakeList({ count: 60 })
    const { client, requests } = setup(handler)

    await expect(client.users.list({ filter: { ACTIVE: true } })).resolves.toEqual(rows)
    expect(requests[0]?.body).toEqual({ filter: { ACTIVE: true }, start: 0 })

    const paginated = []
    for await (const row of client.users.paginate()) paginated.push(row)
    expect(paginated).toEqual(rows)
    await expect(client.users.list()).resolves.toEqual(rows)
  })
})

describe('products service', () => {
  it('unwraps single product results', async () => {
    const { client, requests } = setup((method) =>
      method === 'catalog.product.getFieldsByFilter'
        ? ok({ product: { id: { type: 'integer' } } })
        : method === 'catalog.product.delete'
          ? ok(true)
          : ok({ product: { id: 1 }, element: { id: 2 } })
    )
    const { products } = client

    await expect(products.fields(23)).resolves.toEqual({ id: { type: 'integer' } })
    await expect(products.get(1)).resolves.toEqual({ id: 1 })
    await expect(products.create({ iblockId: 23, name: 'Pump' })).resolves.toEqual({ id: 2 })
    await expect(products.update(2, { name: 'Pump 2' })).resolves.toEqual({ id: 2 })
    await expect(products.delete(2)).resolves.toBe(true)

    expect(requests.map(({ method, body }) => [method, body])).toEqual([
      ['catalog.product.getFieldsByFilter', { filter: { iblockId: 23 } }],
      ['catalog.product.get', { id: 1 }],
      ['catalog.product.add', { fields: { iblockId: 23, name: 'Pump' } }],
      ['catalog.product.update', { id: 2, fields: { name: 'Pump 2' } }],
      ['catalog.product.delete', { id: 2 }]
    ])
  })

  it('lists products by id with the required select fields', async () => {
    const { rows, handler } = fakeList({ count: 70, idField: 'id', wrap: 'products' })
    const { client, requests } = setup(handler)

    await expect(client.products.list({ filter: { iblockId: 23 } })).resolves.toEqual(rows)
    expect(requests[0]?.body).toEqual({
      filter: { iblockId: 23 },
      select: ['name', 'id', 'iblockId'],
      order: { id: 'ASC' },
      start: -1
    })
  })

  it('keeps a custom select without duplicates', async () => {
    const { rows, handler } = fakeList({ count: 3, idField: 'id', wrap: 'products' })
    const { client, requests } = setup(handler)

    const paginated = []
    for await (const row of client.products.paginate({ filter: { iblockId: 23 }, select: ['id', 'xmlId'] })) {
      paginated.push(row)
    }
    expect(paginated).toEqual(rows)
    expect(requests[0]?.body.select).toEqual(['id', 'xmlId', 'iblockId'])
  })
})

describe.each([
  ['deal', 'contact', 'CONTACT_ID'],
  ['lead', 'contact', 'CONTACT_ID'],
  ['company', 'contact', 'CONTACT_ID'],
  ['contact', 'company', 'COMPANY_ID']
] as const)('crm.%s.%s links', (owner, linked, key) => {
  it('maps every method', async () => {
    const { client, requests } = setup()
    const links = {
      deal: client.deals.contacts,
      lead: client.leads.contacts,
      company: client.companies.contacts,
      contact: client.contacts.companies
    }[owner] as any

    await links.get(3)
    await links.set(3, [{ [key]: 5, IS_PRIMARY: 'Y' }, { [key]: 6 }])
    await links.add(3, { [key]: 7, SORT: 30 })
    await expect(links.delete(3, 7)).resolves.toBe(true)
    await links.clear(3)

    const method = `crm.${owner}.${linked}`
    expect(requests.map(({ method, body }) => [method, body])).toEqual([
      [`${method}.items.get`, { id: 3 }],
      [`${method}.items.set`, { id: 3, items: [{ [key]: 5, IS_PRIMARY: 'Y' }, { [key]: 6 }] }],
      [`${method}.add`, { id: 3, fields: { [key]: 7, SORT: 30 } }],
      [`${method}.delete`, { id: 3, fields: { [key]: 7 } }],
      [`${method}.items.delete`, { id: 3 }]
    ])
  })
})

describe('items service', () => {
  it('unwraps single item results and passes the entity type', async () => {
    const { client, requests } = setup((method) =>
      method === 'crm.item.fields'
        ? ok({ fields: { id: { type: 'integer' } } })
        : method === 'crm.item.delete'
          ? ok([])
          : ok({ item: { id: 5 } })
    )
    const items = client.items(1032)

    await expect(items.fields()).resolves.toEqual({ id: { type: 'integer' } })
    await expect(items.get(5)).resolves.toEqual({ id: 5 })
    await expect(items.create({ title: 'Pump' })).resolves.toEqual({ id: 5 })
    await expect(items.update(5, { stageId: 'DT1032_8:SUCCESS' })).resolves.toEqual({ id: 5 })
    await expect(items.delete(5)).resolves.toBeUndefined()

    expect(requests.map(({ method, body }) => [method, body])).toEqual([
      ['crm.item.fields', { entityTypeId: 1032 }],
      ['crm.item.get', { entityTypeId: 1032, id: 5 }],
      ['crm.item.add', { entityTypeId: 1032, fields: { title: 'Pump' } }],
      ['crm.item.update', { entityTypeId: 1032, id: 5, fields: { stageId: 'DT1032_8:SUCCESS' } }],
      ['crm.item.delete', { entityTypeId: 1032, id: 5 }]
    ])
  })

  it('lists items by id across batches', async () => {
    const { rows, handler } = fakeList({ count: 120, idField: 'id', wrap: 'items' })
    const { client, requests } = setup(handler)

    await expect(client.items(2).list({ select: ['title'], filter: { categoryId: 0 } })).resolves.toEqual(rows)
    expect(requests[0]?.body).toEqual({
      entityTypeId: 2,
      select: ['title', 'id'],
      filter: { categoryId: 0 },
      order: { id: 'ASC' },
      start: -1
    })
    expect(decodeURIComponent(requests[1]?.body.cmd[0])).toContain('entityTypeId=2')
  })

  it('paginates by offset', async () => {
    const { rows, handler } = fakeList({ count: 60, idField: 'id', wrap: 'items' })
    const { client } = setup(handler)

    const paginated = []
    for await (const row of client.items(2).paginate({}, { mode: 'offset' })) paginated.push(row)
    expect(paginated).toEqual(rows)
  })

  it('reads changes by updatedTime', async () => {
    const { client, requests } = setup(() => ok({ items: [{ id: 1 }] }))
    const since = '2026-01-01T00:00:00+03:00'

    const rows = []
    for await (const row of client.items(2).changedSince(since, { select: ['id'] })) rows.push(row)

    expect(rows).toEqual([{ id: 1 }])
    expect(requests[0]).toMatchObject({
      method: 'crm.item.list',
      body: {
        entityTypeId: 2,
        select: ['id', 'updatedTime'],
        filter: { '>=updatedTime': since },
        order: { updatedTime: 'ASC', id: 'ASC' }
      }
    })
  })
})
