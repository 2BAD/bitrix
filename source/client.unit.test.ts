import { describe, expect, it } from 'vitest'
import { fakeFetch, fakeList, type Handler, ok, TIME } from './__fixtures__/bitrix.js'
import { createClient } from './client.js'

const setup = (handler: Handler) => {
  const fake = fakeFetch(handler)
  const client = createClient({
    url: 'https://portal.bitrix24.com/rest/1/token',
    fetch: fake.fetch,
    limiter: { burst: 1000 }
  })
  return { ...fake, client }
}

describe('createClient', () => {
  it('exposes the generic methods and services', () => {
    const { client } = setup(() => ok(null))
    expect(Object.keys(client).sort()).toEqual([
      'activities',
      'batch',
      'call',
      'companies',
      'contacts',
      'currencies',
      'deals',
      'leads',
      'list',
      'paginate',
      'products',
      'statuses',
      'users'
    ])
  })

  describe('call', () => {
    it('resolves with the result', async () => {
      const { client, requests } = setup(() => ok({ ID: '77' }))
      await expect(client.call('crm.deal.get', { id: 77 })).resolves.toEqual({ ID: '77' })
      expect(requests[0]).toMatchObject({ method: 'crm.deal.get', body: { id: 77 } })
    })

    it('resolves with the whole envelope when raw is set', async () => {
      const { client } = setup(() => ok([{ ID: '1' }], { total: 1 }))
      await expect(client.call('crm.deal.list', {}, { raw: true })).resolves.toEqual({
        result: [{ ID: '1' }],
        total: 1,
        time: TIME
      })
    })

    it('calls methods without params', async () => {
      const { client, requests } = setup(() => ok({}))
      await client.call('crm.deal.fields')
      expect(requests[0]?.body).toEqual({})
    })

    it('passes the abort signal', async () => {
      const controller = new AbortController()
      const { client, requests } = setup(() => ok({}))
      await client.call('crm.deal.fields', {}, { signal: controller.signal })
      expect(requests[0]?.init.signal).toBe(controller.signal)
    })
  })

  describe('list', () => {
    it('collects every page into an array', async () => {
      const { rows, handler } = fakeList({ count: 120 })
      const { client } = setup(handler)
      await expect(client.list('crm.deal.list')).resolves.toEqual(rows)
    })

    it('forwards params and options', async () => {
      const { handler } = fakeList({ count: 3 })
      const { client, requests } = setup(handler)
      await client.list('crm.deal.list', { order: { TITLE: 'ASC' } }, { mode: 'offset' })
      expect(requests[0]?.body).toEqual({ order: { TITLE: 'ASC' }, start: 0 })
    })
  })
})
