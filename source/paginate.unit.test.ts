import { describe, expect, it } from 'vitest'
import { fakeFetch, fakeList, ok, type Handler } from './__fixtures__/bitrix.js'
import { createBatch } from './batch.js'
import { createPaginate, type PaginateProgress } from './paginate.js'
import { createTransport, type RetryOptions } from './transport.js'

const setup = (handler: Handler, retry: RetryOptions = {}) => {
  const fake = fakeFetch(handler)
  const transport = createTransport(
    { url: 'https://portal.bitrix24.com/rest/1/token', fetch: fake.fetch },
    { acquire: () => Promise.resolve(), exhaust: () => {} },
    { retries: 3, delay: 1000 }
  )
  return { ...fake, paginate: createPaginate(transport, createBatch(transport, { retries: 3, delay: 1000, ...retry })) }
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

    it('requests the first page without a count, then chained batches that double up to 50 pages', async () => {
      const { handler } = fakeList({ count: 2551 })
      const { paginate, requests } = setup(handler)

      await collect(paginate('crm.deal.list', { select: ['ID', 'TITLE'] }))

      expect(requests.map((request) => request.method)).toEqual(['crm.deal.list', ...Array(6).fill('batch')])
      expect(requests.map((request) => commandCount(request.body))).toEqual([1, 1, 2, 4, 8, 16, 32])
      expect(requests[0]?.body).toEqual({ select: ['ID', 'TITLE'], filter: {}, order: { ID: 'ASC' }, start: -1 })
      expect(decodeURIComponent(requests[1]?.body.cmd[0])).toBe(
        'crm.deal.list?select[0]=ID&select[1]=TITLE&filter[>ID]=100&order[ID]=ASC&start=-1'
      )
      expect(decodeURIComponent(requests[2]?.body.cmd[1])).toContain('filter[>ID]=$result[0][49][ID]')
    })

    it('stops at the first short page after a full one', async () => {
      const { rows, handler } = fakeList({ count: 100 })
      const { paginate, requests } = setup(handler)
      await expect(collect(paginate('crm.deal.list'))).resolves.toEqual(rows)
      expect(requests.map((request) => commandCount(request.body))).toEqual([1, 1, 2])
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
      expect(decodeURIComponent(requests[2]?.body.cmd[1])).toContain('filter[>id]=$result[0][products][49][id]')
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

    it('fetches the remaining pages in batches of offsets that double up to 50 pages', async () => {
      const { handler } = fakeList({ count: 2600 })
      const { paginate, requests } = setup(handler)

      await collect(paginate('crm.deal.list', { order: { TITLE: 'DESC' } }, { mode: 'offset' }))

      expect(requests.map((request) => commandCount(request.body))).toEqual([1, 1, 2, 4, 8, 16, 20])
      expect(requests[0]?.body).toEqual({ order: { TITLE: 'DESC' }, start: 0 })
      expect(decodeURIComponent(requests[1]?.body.cmd[0])).toBe('crm.deal.list?order[TITLE]=DESC&start=50')
      expect(decodeURIComponent(requests[6]?.body.cmd[19])).toBe('crm.deal.list?order[TITLE]=DESC&start=2550')
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

describe('paginate operating time limit', () => {
  const LIMITED = { error: 'OPERATION_TIME_LIMIT' }

  const limitCommand = (list: ReturnType<typeof fakeList>, request: number, command: string) => {
    let calls = 0
    return (async (method, body) => {
      calls += 1
      const reply: any = await list.handler(method, body)
      if (calls === request || (request === Infinity && method === 'batch')) {
        const results = Object.fromEntries(Object.entries(reply.body.result.result).filter(([key]) => key !== command))
        reply.body.result = { ...reply.body.result, result: results, result_error: { [command]: LIMITED } }
      }
      return reply
    }) satisfies Handler
  }

  it('resumes the cursor after a chained page hits the limit', async () => {
    const list = fakeList({ count: 400 })
    const { paginate, requests } = setup(limitCommand(list, 4, '2'), { delay: 0 })

    await expect(collect(paginate('crm.deal.list'))).resolves.toEqual(list.rows)
    expect(requests.map((request) => commandCount(request.body))).toEqual([1, 1, 2, 4, 8])
  })

  it('throws when the first page of a batch keeps hitting the limit', async () => {
    const list = fakeList({ count: 200 })
    const { paginate, requests } = setup(limitCommand(list, Infinity, '0'), { retries: 1, delay: 0 })

    await expect(collect(paginate('crm.deal.list'))).rejects.toMatchObject({ code: 'OPERATION_TIME_LIMIT' })
    expect(requests).toHaveLength(3)
  })

  it('throws in offset mode when a page still hits the limit after retries', async () => {
    const list = fakeList({ count: 300 })
    const { paginate } = setup(limitCommand(list, Infinity, '1'), { retries: 0 })

    await expect(collect(paginate('crm.deal.list', {}, { mode: 'offset' }))).rejects.toMatchObject({
      code: 'OPERATION_TIME_LIMIT',
      command: '1'
    })
  })
})

describe('paginate modified mode', () => {
  const BASE = Date.parse('2026-01-01T00:00:00.000Z')
  const at = (seconds: number) => new Date(BASE + seconds * 1000).toISOString()
  const changed = (rows: ReadonlyArray<Record<string, string>>, since: string) =>
    rows
      .filter((row) => (row['DATE_MODIFY'] as string) >= since)
      .toSorted(
        (a, b) =>
          (a['DATE_MODIFY'] as string).localeCompare(b['DATE_MODIFY'] as string) || Number(a['ID']) - Number(b['ID'])
      )

  it.each([0, 1, 50, 51, 175])('returns %i rows in the order they changed', async (count) => {
    const list = fakeList({ count, modified: (index) => at((index * 7) % 13) })
    const { paginate } = setup(list.handler)
    const rows = await collect(paginate('crm.deal.list', {}, { mode: 'modified', since: at(0) }))
    expect(rows).toEqual(changed(list.rows, at(0)))
  })

  it('reads more than a page of rows sharing one modification time', async () => {
    const list = fakeList({ count: 300, modified: (index) => at(index < 20 ? index : index < 260 ? 100 : index) })
    const { paginate, requests } = setup(list.handler)

    const rows = await collect(paginate('crm.deal.list', { select: ['ID'] }, { mode: 'modified', since: at(5) }))

    expect(rows).toEqual(changed(list.rows, at(5)))
    expect(new Set(rows.map((row) => row['ID'])).size).toBe(rows.length)
    expect(requests[0]?.body).toEqual({
      select: ['ID', 'DATE_MODIFY'],
      filter: { '>=DATE_MODIFY': at(5) },
      order: { DATE_MODIFY: 'ASC', ID: 'ASC' },
      start: -1
    })
    expect(requests[1]?.body.filter).toEqual({ '=DATE_MODIFY': at(100), '>ID': '110' })
  })

  it('only returns rows changed at or after since', async () => {
    const list = fakeList({ count: 120, modified: (index) => at(index) })
    const { paginate } = setup(list.handler)
    const rows = await collect(paginate('crm.deal.list', {}, { mode: 'modified', since: at(100) }))
    expect(rows.map((row) => row['DATE_MODIFY'])).toEqual(Array.from({ length: 20 }, (_, index) => at(100 + index)))
  })

  it('accepts a Date and a custom field, keeping the caller filter and select', async () => {
    const { paginate, requests } = setup(() => ok([]))
    await collect(
      paginate(
        'crm.activity.list',
        { select: ['SUBJECT'], filter: { COMPLETED: 'N' }, order: { LAST_UPDATED: 'ASC' }, start: 10 },
        { mode: 'modified', since: new Date(BASE), modifiedField: 'LAST_UPDATED' }
      )
    )
    expect(requests[0]?.body).toEqual({
      select: ['SUBJECT', 'ID', 'LAST_UPDATED'],
      filter: { COMPLETED: 'N', '>=LAST_UPDATED': at(0) },
      order: { LAST_UPDATED: 'ASC', ID: 'ASC' },
      start: -1
    })
  })

  it('rejects an order by another field', async () => {
    const { paginate } = setup(() => ok([]))
    await expect(
      collect(paginate('crm.deal.list', { order: { TITLE: 'ASC' } }, { mode: 'modified', since: at(0) }))
    ).rejects.toThrow('modified pagination orders by DATE_MODIFY and ID')
  })
})

describe('paginate progress', () => {
  const progressOf = async (iterable: AsyncIterable<unknown>, events: PaginateProgress[]) => {
    await collect(iterable)
    return events
  }

  it('counts the rows on the first cursor request and reports every page', async () => {
    const { handler } = fakeList({ count: 120 })
    const { paginate, requests } = setup(handler)
    const events: PaginateProgress[] = []

    await progressOf(paginate('crm.deal.list', {}, { onProgress: (event) => events.push(event) }), events)

    expect(requests[0]?.body).toEqual({ filter: {}, order: { ID: 'ASC' } })
    expect(decodeURIComponent(requests[1]?.body.cmd[0])).toContain('start=-1')
    expect(events).toEqual([
      { read: 50, total: 120 },
      { read: 100, total: 120 },
      { read: 120, total: 120 }
    ])
  })

  it('reports the total of offset reads', async () => {
    const { handler } = fakeList({ count: 75 })
    const { paginate } = setup(handler)
    const events: PaginateProgress[] = []
    await progressOf(
      paginate('crm.deal.list', {}, { mode: 'offset', onProgress: (event) => events.push(event) }),
      events
    )
    expect(events).toEqual([
      { read: 50, total: 75 },
      { read: 75, total: 75 }
    ])
  })

  it('counts only the first request of a modified read', async () => {
    const BASE = Date.parse('2026-01-01T00:00:00.000Z')
    const { handler } = fakeList({ count: 130, modified: (index) => new Date(BASE + (index % 3) * 1000).toISOString() })
    const { paginate, requests } = setup(handler)
    const events: PaginateProgress[] = []

    const rows = await collect(
      paginate(
        'crm.deal.list',
        {},
        { mode: 'modified', since: new Date(BASE), onProgress: (event) => events.push(event) }
      )
    )

    expect(rows).toHaveLength(130)
    expect(requests[0]?.body).not.toHaveProperty('start')
    expect(requests.slice(1).every((request) => request.body.start === -1 || request.body.cmd)).toBe(true)
    expect(events.at(-1)).toEqual({ read: 130, total: 130 })
    expect(events.every((event) => event.total === 130)).toBe(true)
  })

  it('leaves the total out when Bitrix does not report one', async () => {
    const { paginate } = setup(() => ok([{ ID: '1' }]))
    const events: PaginateProgress[] = []
    await progressOf(paginate('custom.list', {}, { onProgress: (event) => events.push(event) }), events)
    expect(events).toEqual([{ read: 1 }])
  })
})
