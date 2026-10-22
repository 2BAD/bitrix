import { describe, expect, it } from 'vitest'
import { fakeFetch, fakeList, ok, type Handler } from './__fixtures__/bitrix.js'
import { createBatch } from './batch.js'
import { createPaginate } from './paginate.js'
import { createTransport } from './transport.js'

const setup = (handler: Handler) => {
  const fake = fakeFetch(handler)
  const transport = createTransport(
    { url: 'https://portal.bitrix24.com/rest/1/token', fetch: fake.fetch },
    { acquire: () => Promise.resolve(), exhaust: () => {} }
  )
  return { ...fake, paginate: createPaginate(transport, createBatch(transport)) }
}

const collect = async <T>(iterable: AsyncIterable<T>) => {
  const rows: T[] = []
  for await (const row of iterable) rows.push(row)
  return rows
}

const commandCount = (body: any) => (body.cmd ? Object.keys(body.cmd).length : 1)

describe('paginate', () => {
  describe('cursor mode', () => {
    it.each([0, 1, 49, 50, 51, 100, 2500, 2551, 5050])('returns every row exactly once for %i rows', async (count) => {
      const { rows, handler } = fakeList({ count })
      const { paginate } = setup(handler)
      await expect(collect(paginate('crm.deal.list'))).resolves.toEqual(rows)
    })

    it('requests the first page without a count, then chained batches of 50 pages', async () => {
      const { handler } = fakeList({ count: 2551 })
      const { paginate, requests } = setup(handler)

      await collect(paginate('crm.deal.list', { select: ['ID', 'TITLE'] }))

      expect(requests.map((request) => request.method)).toEqual(['crm.deal.list', 'batch', 'batch'])
      expect(requests.map((request) => commandCount(request.body))).toEqual([1, 50, 50])
      expect(requests[0]?.body).toEqual({ select: ['ID', 'TITLE'], filter: {}, order: { ID: 'ASC' }, start: -1 })
      expect(decodeURIComponent(requests[1]?.body.cmd[0])).toBe(
        'crm.deal.list?select[0]=ID&select[1]=TITLE&filter[>ID]=100&order[ID]=ASC&start=-1'
      )
      expect(decodeURIComponent(requests[1]?.body.cmd[1])).toContain('filter[>ID]=$result[0][49][ID]')
    })

    it('probes once more when the last page is full', async () => {
      const { rows, handler } = fakeList({ count: 100 })
      const { paginate, requests } = setup(handler)
      await expect(collect(paginate('crm.deal.list'))).resolves.toEqual(rows)
      expect(requests.map((request) => commandCount(request.body))).toEqual([1, 50])
    })

    it('picks up rows added while paginating', async () => {
      const list = fakeList({ count: 120 })
      let calls = 0
      const { paginate } = setup((method, body) => {
        calls += 1
        if (calls === 2) list.rows.push(...Array.from({ length: 60 }, (_, index) => ({ ID: String(1000 + index) })))
        return list.handler(method, body)
      })
      await expect(collect(paginate('crm.deal.list'))).resolves.toHaveLength(180)
    })

    it('ignores invalid commands after a short page in the same batch', async () => {
      const list = fakeList({ count: 300 })
      let calls = 0
      const { paginate } = setup((method, body) => {
        calls += 1
        if (calls === 2) list.rows.splice(120)
        return list.handler(method, body)
      })
      const rows = await collect(paginate('crm.deal.list'))
      expect(rows).toHaveLength(120)
      expect(new Set(rows.map((row) => row['ID'])).size).toBe(120)
    })

    it('keeps the caller filter and adds the id field to the select', async () => {
      const { handler } = fakeList({ count: 10 })
      const { paginate, requests } = setup(handler)
      await collect(paginate('crm.deal.list', { filter: { STAGE_ID: 'WON' }, select: ['TITLE'], start: 100 }))
      expect(requests[0]?.body).toEqual({
        filter: { STAGE_ID: 'WON' },
        select: ['TITLE', 'ID'],
        order: { ID: 'ASC' },
        start: -1
      })
    })

    it('leaves wildcard selects alone', async () => {
      const { handler } = fakeList({ count: 1 })
      const { paginate, requests } = setup(handler)
      await collect(paginate('crm.deal.list', { select: ['*', 'UF_*'] }))
      expect(requests[0]?.body.select).toEqual(['*', 'UF_*'])
    })

    it('accepts an explicit ascending order by id', async () => {
      const { handler } = fakeList({ count: 1 })
      const { paginate } = setup(handler)
      await expect(collect(paginate('crm.deal.list', { order: { ID: 'ASC' } }))).resolves.toHaveLength(1)
    })

    it('rejects an order by another field', async () => {
      const { handler } = fakeList({ count: 1 })
      const { paginate } = setup(handler)
      await expect(collect(paginate('crm.deal.list', { order: { TITLE: 'ASC' } }))).rejects.toThrow(
        "cursor pagination orders by ID, use { mode: 'offset' } for a custom order"
      )
    })

    it('unwraps catalog style results and uses a custom id field', async () => {
      const { rows, handler } = fakeList({ count: 130, idField: 'id', wrap: 'products' })
      const { paginate, requests } = setup(handler)

      const result = await collect(
        paginate('catalog.product.list', { filter: { iblockId: 23 }, select: ['id', 'iblockId'] }, { idField: 'id' })
      )

      expect(result).toEqual(rows)
      expect(decodeURIComponent(requests[1]?.body.cmd[1])).toContain('filter[>id]=$result[0][products][49][id]')
    })

    it('stops requesting when the consumer breaks early', async () => {
      const { handler } = fakeList({ count: 5000 })
      const { paginate, requests } = setup(handler)
      for await (const row of paginate('crm.deal.list')) {
        if (row['ID'] === '10') break
      }
      expect(requests).toHaveLength(1)
    })

    it('throws the first failed command', async () => {
      const list = fakeList({ count: 200 })
      const { paginate } = setup((method, body) =>
        method === 'batch'
          ? ok({ result: [], result_error: [{ error: 'ACCESS_DENIED' }], result_total: [], result_next: [] })
          : list.handler(method, body)
      )
      await expect(collect(paginate('crm.deal.list'))).rejects.toMatchObject({ code: 'ACCESS_DENIED', command: '0' })
    })

    it('throws when a method does not return a list', async () => {
      const { paginate } = setup(() => ok({ a: 1, b: 2 }))
      await expect(collect(paginate('crm.deal.get', { id: 1 }))).rejects.toThrow('crm.deal.get did not return a list')
    })

    it('throws when a method returns a scalar', async () => {
      const { paginate } = setup(() => ok(true))
      await expect(collect(paginate('a.b'))).rejects.toThrow('a.b did not return a list')
    })

    it('passes the abort signal to every request', async () => {
      const controller = new AbortController()
      const { handler } = fakeList({ count: 60 })
      const { paginate, requests } = setup(handler)
      await collect(paginate('crm.deal.list', {}, { signal: controller.signal }))
      expect(requests.map((request) => request.init.signal)).toEqual([controller.signal, controller.signal])
    })
  })

  describe('offset mode', () => {
    it.each([0, 1, 50, 51, 2550, 2551, 5100])('returns every row exactly once for %i rows', async (count) => {
      const { rows, handler } = fakeList({ count })
      const { paginate } = setup(handler)
      await expect(collect(paginate('crm.deal.list', {}, { mode: 'offset' }))).resolves.toEqual(rows)
    })

    it('fetches the remaining pages in batches of offsets', async () => {
      const { handler } = fakeList({ count: 2600 })
      const { paginate, requests } = setup(handler)

      await collect(paginate('crm.deal.list', { order: { TITLE: 'DESC' } }, { mode: 'offset' }))

      expect(requests.map((request) => commandCount(request.body))).toEqual([1, 50, 1])
      expect(requests[0]?.body).toEqual({ order: { TITLE: 'DESC' }, start: 0 })
      expect(decodeURIComponent(requests[1]?.body.cmd[0])).toBe('crm.deal.list?order[TITLE]=DESC&start=50')
      expect(decodeURIComponent(requests[2]?.body.cmd[0])).toBe('crm.deal.list?order[TITLE]=DESC&start=2550')
    })

    it('starts from the given offset', async () => {
      const { rows, handler } = fakeList({ count: 120 })
      const { paginate } = setup(handler)
      await expect(collect(paginate('crm.deal.list', { start: 100 }, { mode: 'offset' }))).resolves.toEqual(
        rows.slice(100)
      )
    })

    it('handles a list without a total', async () => {
      const { paginate } = setup(() => ok([{ ID: '1' }], { next: 50 }))
      await expect(collect(paginate('crm.deal.list', {}, { mode: 'offset' }))).resolves.toEqual([{ ID: '1' }])
    })
  })
})
