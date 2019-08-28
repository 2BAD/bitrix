/* eslint-env jest */
// tslint:disable: no-expression-statement

import got from 'got'
import nock from 'nock'
import { APIMethod } from '../../types'
import prepareGetList, { handleGetListPayload } from './getList'

const TEST_URI = 'https://test.com/rest'
const get = prepareGetList(got.extend({ baseUrl: TEST_URI, json: true }))
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
    const query = { test: 1 }

    const scope = nock(TEST_URI)
      .get(`/${APIMethod.LIST_DEALS}`)
      .query(query)
      .reply(RESPONSE_200)

    await get(APIMethod.LIST_DEALS, query)

    expect(scope.done()).toBe(undefined)
  })

  it('should return body as payload', async () => {
    const payload = { result: ['done'] }

    nock(TEST_URI)
      .get(`/${APIMethod.LIST_DEALS}`)
      .reply(RESPONSE_200, payload)

    expect(await get(APIMethod.LIST_DEALS)).toEqual(payload)
  })

  it.todo('should cast payload to the <P>')

  it('should throw when getting errors in payload', () => {
    const payload = { result: ['done'], error: 'Expected error for `getList`' }

    nock(TEST_URI)
      .get(`/${APIMethod.LIST_DEALS}`)
      .reply(RESPONSE_200, payload)

    return expect(get(APIMethod.LIST_DEALS)).rejects.toMatchSnapshot()
  })
})
