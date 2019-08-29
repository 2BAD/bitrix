/* eslint-env jest */
// tslint:disable: no-expression-statement

import got from 'got'
import nock from 'nock'
import { Method } from '../../types'
import GetList, { handleGetListPayload } from './getList'

const TEST_URI = 'https://test.com/rest'
const get = GetList(got.extend({ baseUrl: TEST_URI, json: true }))
const RESPONSE_200 = 200

describe('Bitrix `handleGetListPayload` method', () => {
  it('should return payload', () => {
    const payload = {
      error: undefined,
      next: undefined,
      result: ['done'],
      time: { start: 1, finish: 1, duration: 1, processing: 1, date_start: 'date', date_finish: 'date' },
      total: 1
    }

    expect(handleGetListPayload(payload)).toBe(payload)
  })

  it('should throw when getting errors in payload', () => {
    const payload = {
      error: 'Expected error for `handleGetListPayload`',
      next: undefined,
      result: ['done'],
      time: { start: 1, finish: 1, duration: 1, processing: 1, date_start: 'date', date_finish: 'date' },
      total: 1
    }

    expect(() => handleGetListPayload(payload)).toThrowErrorMatchingSnapshot()
  })
})

describe('Bitrix `getList` method', () => {
  it('should form a proper request', async () => {
    const params = {
      filter: { '>PROBABILITY': 50 },
      order: { STAGE_ID: 'ASC' },
      select: ['ID', 'TITLE'],
      start: 50
    } as const

    const scope = nock(TEST_URI)
      .get(`/${Method.LIST_DEALS}`)
      .query(params)
      .reply(RESPONSE_200)

    await get(Method.LIST_DEALS, params)

    expect(scope.done()).toBe(undefined)
  })

  it('should return body as payload', async () => {
    const payload = { result: ['done'] }

    nock(TEST_URI)
      .get(`/${Method.LIST_DEALS}`)
      .reply(RESPONSE_200, payload)

    expect(await get(Method.LIST_DEALS)).toEqual(payload)
  })

  it.todo('should cast payload to the <P>')

  it('should throw when getting errors in payload', () => {
    const payload = { result: ['done'], error: 'Expected error for `getList`' }

    nock(TEST_URI)
      .get(`/${Method.LIST_DEALS}`)
      .reply(RESPONSE_200, payload)

    return expect(get(Method.LIST_DEALS)).rejects.toMatchSnapshot()
  })
})
