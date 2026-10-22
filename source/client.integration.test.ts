import { describe, expect, it } from 'vitest'
import { BitrixError, createClient, type CrmService } from './index.js'

const WEBHOOK_URL = process.env['WEBHOOK_URL']

if (!WEBHOOK_URL) {
  throw new Error('Integration tests require environmental variable `WEBHOOK_URL` to be set')
}

const client = createClient({ url: WEBHOOK_URL })

const take = async <T>(iterable: AsyncIterable<T>, count: number) => {
  const rows: T[] = []
  for await (const row of iterable) {
    rows.push(row)
    if (rows.length === count) break
  }
  return rows
}

const ids = (rows: ReadonlyArray<{ readonly ID: string }>) => rows.map((row) => Number(row.ID))

describe.each(['activities', 'companies', 'contacts', 'deals', 'leads'] as const)('%s', (name) => {
  const service: CrmService<any> = client[name]

  it('gets fields', async () => {
    const fields = await service.fields()
    expect(fields['ID']).toMatchObject({ type: 'integer', isReadOnly: true })
  })

  it('paginates by ascending id and gets a single entity', async () => {
    const rows = await take(service.paginate({ select: ['ID'] }) as AsyncIterable<{ readonly ID: string }>, 120)
    const sorted = ids(rows).toSorted((a, b) => a - b)
    expect(ids(rows)).toEqual(sorted)
    expect(new Set(sorted).size).toBe(rows.length)

    const [first] = rows
    if (!first) return
    const entity = await service.get(first.ID)
    expect(entity.ID).toBe(first.ID)
  })
})

describe('list modes', () => {
  it('returns the same companies by cursor and by offset', async () => {
    const [cursor, offset] = await Promise.all([
      client.companies.list({ select: ['ID'] }),
      client.companies.list({ select: ['ID'], order: { ID: 'ASC' } }, { mode: 'offset' })
    ])
    expect(cursor.length).toBeGreaterThan(0)
    expect(ids(cursor)).toEqual(ids(offset))
  })
})

describe('call', () => {
  it('returns the envelope with timing info when raw', async () => {
    const envelope = await client.call('crm.deal.list', { select: ['ID'] }, { raw: true })
    expect(envelope.total).toBeGreaterThanOrEqual(envelope.result.length)
    expect(envelope.time).toMatchObject({ operating_reset_at: expect.any(Number) })
  })

  it('throws BitrixError for a missing entity', async () => {
    const error = await client.deals.get(999_999_999).catch((caught: unknown) => caught)
    expect(error).toBeInstanceOf(BitrixError)
    expect(error).toMatchObject({ status: 400, description: 'Not found' })
  })

  it('throws BitrixError for an unknown method', async () => {
    await expect(client.call('no.such.method')).rejects.toMatchObject({ code: 'ERROR_METHOD_NOT_FOUND', status: 404 })
  })
})

describe('batch', () => {
  it('returns results and per command errors', async () => {
    const { results, errors } = await client.batch({
      fields: { method: 'crm.deal.fields' },
      missing: { method: 'crm.deal.get', params: { id: 999_999_999 } }
    })
    expect(results.fields).toHaveProperty('ID')
    expect(errors.fields).toBeUndefined()
    expect(errors.missing).toMatchObject({ method: 'crm.deal.get', command: 'missing', description: 'Not found' })
  })
})

describe('deal product rows', () => {
  it('gets product rows of a deal', async () => {
    const [deal] = await take(client.deals.paginate({ select: ['ID'], filter: { '>OPPORTUNITY': 0 } }), 1)
    if (!deal) return
    const rows = await client.deals.productRows.get(deal.ID)
    expect(Array.isArray(rows)).toBe(true)
  })
})

describe('statuses', () => {
  it('lists every status and gets one by id', async () => {
    const statuses = await client.statuses.list()
    expect(statuses.length).toBeGreaterThan(0)
    const [first] = statuses
    if (!first) return
    await expect(client.statuses.get(first.ID)).resolves.toMatchObject({ ID: first.ID, ENTITY_ID: first.ENTITY_ID })
    await expect(client.statuses.fields()).resolves.toHaveProperty('STATUS_ID')
  })
})

describe('users', () => {
  it('lists users and gets one by id', async () => {
    const users = await client.users.list()
    expect(users.length).toBeGreaterThan(0)
    const [first] = users
    if (!first) return
    await expect(client.users.get(first.ID)).resolves.toMatchObject({ ID: first.ID })
    await expect(client.users.fields()).resolves.toHaveProperty('ID')
  })
})

describe('products', () => {
  it('finds catalogs, paginates products and gets one', async () => {
    const { catalogs } = (await client.call('catalog.catalog.list')) as { catalogs: Array<{ iblockId: number }> }
    const [catalog] = catalogs
    if (!catalog) return

    const products = await take(client.products.paginate({ filter: { iblockId: catalog.iblockId } }), 120)
    const productIds = products.map((product) => product.id)
    expect(productIds).toEqual(productIds.toSorted((a, b) => a - b))
    expect(new Set(productIds).size).toBe(products.length)

    const [first] = products
    if (!first) return
    await expect(client.products.get(first.id)).resolves.toMatchObject({ id: first.id, iblockId: catalog.iblockId })
    await expect(client.products.fields(catalog.iblockId)).resolves.toHaveProperty('id')
  })
})

describe('changedSince', () => {
  it('returns the same deals as a filtered list, oldest change first', async () => {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const changed = []
    for await (const deal of client.deals.changedSince(since, { select: ['ID', 'DATE_MODIFY'] })) changed.push(deal)
    const filtered = await client.deals.list({ select: ['ID'], filter: { '>=DATE_MODIFY': since.toISOString() } })

    const times = changed.map((deal) => Date.parse(deal.DATE_MODIFY))
    expect(times).toEqual(times.toSorted((a, b) => a - b))
    expect(ids(changed).toSorted((a, b) => a - b)).toEqual(ids(filtered))
  })

  it('reads activities by LAST_UPDATED', async () => {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const activities = await take(client.activities.changedSince(since, { select: ['ID', 'LAST_UPDATED'] }), 120)
    for (const activity of activities) {
      expect(Date.parse(activity.LAST_UPDATED)).toBeGreaterThanOrEqual(since.getTime() - 1000)
    }
  })
})
