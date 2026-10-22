import { describe, expect, it } from 'vitest'
import { fakeFetch, fakeList, type Handler, ok } from '../__fixtures__/bitrix.js'
import { createClient } from '../client.js'
import { BitrixError } from '../errors.js'

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
  const service = (client: ReturnType<typeof setup>['client']) =>
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
