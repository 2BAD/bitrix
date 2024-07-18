import got from 'got'
import nock from 'nock'
import { describe, expect, it } from 'vitest'
import { Method } from '../../methods.js'
import { BatchPayload, GetPayload, ListPayload } from '../../payloads.js'
import Call, { handlePayload } from './call.js'

const TEST_URI = 'https://test.com/rest'
const call = Call({
  get: got.extend({ prefixUrl: TEST_URI, responseType: 'json' }).get
})
const RESPONSE_200 = 200

describe('Client `handlePayload` method', () => {
  it('should return `GetPayload`', () => {
    const payload: GetPayload<any> = {
      result: 'done',
      time: { start: 1, finish: 1, duration: 1, processing: 1, date_start: 'date', date_finish: 'date' }
    }

    expect(handlePayload(payload)).toBe(payload)
  })

  it('should return `ListPayload`', () => {
    const payload: ListPayload<any> = {
      error: undefined,
      next: undefined,
      result: ['done'],
      time: { start: 1, finish: 1, duration: 1, processing: 1, date_start: 'date', date_finish: 'date' },
      total: 1
    }

    expect(handlePayload(payload)).toBe(payload)
  })

  it('should throw when getting error in `ListPayload`', () => {
    const payload: ListPayload<any> = {
      error: 'Expected error for `handlePayload`',
      next: undefined,
      result: ['done'],
      time: { start: 1, finish: 1, duration: 1, processing: 1, date_start: 'date', date_finish: 'date' },
      total: 1
    }

    expect(() => handlePayload(payload)).toThrowErrorMatchingSnapshot()
  })

  it('should return `BatchPayload` with numbered commands', () => {
    const payload: BatchPayload<any> = {
      result: {
        result: { one: 'done' },
        result_error: [],
        result_next: [],
        result_time: [],
        result_total: []
      },
      time: { start: 1, finish: 1, duration: 1, processing: 1, date_start: 'date', date_finish: 'date' }
    }

    expect(handlePayload(payload)).toBe(payload)
  })

  it('should return `BatchPayload` with result from array of commands', () => {
    const payload: BatchPayload<any> = {
      result: {
        result: ['done'],
        result_error: [],
        result_next: [],
        result_time: [],
        result_total: []
      },
      time: { start: 1, finish: 1, duration: 1, processing: 1, date_start: 'date', date_finish: 'date' }
    }

    expect(handlePayload(payload)).toBe(payload)
  })

  it('should throw when getting errors in `BatchPayload` with result from named commands', () => {
    const payload: BatchPayload<any> = {
      result: {
        result: { one: 'done' },
        result_error: { one: 'Expected error for `handlePayload`' },
        result_next: [],
        result_time: [],
        result_total: []
      },
      time: { start: 1, finish: 1, duration: 1, processing: 1, date_start: 'date', date_finish: 'date' }
    }

    expect(() => handlePayload(payload)).toThrowErrorMatchingSnapshot()
  })

  it('should throw when getting errors in `BatchPayload` with result from array of commands', () => {
    const payload: BatchPayload<any> = {
      result: {
        result: ['done'],
        result_error: ['Expected error for `handlePayload`'],
        result_next: [],
        result_time: [],
        result_total: []
      },
      time: { start: 1, finish: 1, duration: 1, processing: 1, date_start: 'date', date_finish: 'date' }
    }

    expect(() => handlePayload(payload)).toThrowErrorMatchingSnapshot()
  })
})

describe('Client `call` method', () => {
  it('should form a proper request', async () => {
    const params = { id: '1' }

    const scope = nock(TEST_URI)
      .get(`/${Method.CRM_DEAL_GET}`)
      .query(params)
      .reply(RESPONSE_200)

    await call(Method.CRM_DEAL_GET, params)

    expect(scope.done()).toBe(undefined)
  })

  it('should form a proper request with list methods', async () => {
    const params = {
      filter: { '>PROBABILITY': 50 },
      order: { STAGE_ID: 'ASC' },
      select: ['ID', 'TITLE'],
      start: 50
    }

    const scope = nock(TEST_URI)
      .get(`/${Method.CRM_DEAL_LIST}`)
      .query(params)
      .reply(RESPONSE_200)

    await call(Method.CRM_DEAL_LIST, params)

    expect(scope.done()).toBe(undefined)
  })

  it('should return body as payload', async () => {
    const params = { id: '1' }
    const payload = { test: 'value' }

    nock(TEST_URI)
      .get(`/${Method.CRM_DEAL_GET}`)
      .query(params)
      .reply(RESPONSE_200, payload)

    expect(await call(Method.CRM_DEAL_GET, params)).toEqual(payload)
  })

  it('should return body as payload with list methods', async () => {
    const payload = { result: ['done'] }

    nock(TEST_URI)
      .get(`/${Method.CRM_DEAL_LIST}`)
      .reply(RESPONSE_200, payload)

    expect(await call(Method.CRM_DEAL_LIST, {})).toEqual(payload)
  })

  it('should throw when getting errors in payload', () => {
    const payload = { result: ['done'], error: 'Expected error for `getList`' }

    nock(TEST_URI)
      .get(`/${Method.CRM_DEAL_LIST}`)
      .reply(RESPONSE_200, payload)

    return expect(call(Method.CRM_DEAL_LIST, {})).rejects.toMatchSnapshot()
  })

  it('should throw when getting errors in batch payload', () => {
    const payload: BatchPayload<any> = {
      result: {
        result: ['done'],
        result_error: ['Expected error'],
        result_next: [],
        result_time: [],
        result_total: []
      },
      time: { start: 1, finish: 1, duration: 1, processing: 1, date_start: 'date', date_finish: 'date' }
    }

    nock(TEST_URI)
      .get(`/${Method.BATCH}`)
      .reply(RESPONSE_200, payload)

    return expect(call(Method.BATCH, {})).rejects.toMatchSnapshot()
  })

  it.todo('should cast payload to the <P>')
})
