/* eslint-env jest */
// tslint:disable: no-expression-statement

import got from 'got'
import range from 'lodash.range'
import nock from 'nock'
import { BitrixMethod } from '../types'
import prepareBatch, { commandsToBatchQuery, handleBatchPayload, MAX_COMMANDS_PER_BATCH } from './batch'

describe('Bitrix `commandsToBatchQuery` method', () => {
  it('should transform dict of the commands into the query object', () => {
    const testDealId = 11111

    const commands = {
      one: {
        method: BitrixMethod.GET_DEAL,
        params: { ID: testDealId }
      },
      two: {
        method: BitrixMethod.LIST_DEALS
      }
    }

    expect(commandsToBatchQuery(commands)).toMatchSnapshot()
  })

  it('should work with numbered commands', () => {
    const commands = {
      0: { method: BitrixMethod.GET_DEAL },
      1: { method: BitrixMethod.LIST_DEALS }
    }

    expect(commandsToBatchQuery(commands)).toMatchSnapshot()
  })

  it('should return empty query object when no commands provided', () => {
    expect(commandsToBatchQuery({})).toMatchSnapshot()
  })
})

describe('Bitrix `handleBatchPayload` method', () => {
  it('should return payload', () => {
    const payload = {
      result: {
        result: { one: 'done' },
        result_error: [],
        result_next: [],
        result_time: [],
        result_total: []
      },
      time: { start: 1, finish: 1, duration: 1, processing: 1, date_start: 'date', date_finish: 'date' }
    }

    expect(handleBatchPayload(payload)).toBe(payload)
  })

  it('should return payload of numbered batch', () => {
    const payload = {
      result: {
        result: ['done'],
        result_error: [],
        result_next: [],
        result_time: [],
        result_total: []
      },
      time: { start: 1, finish: 1, duration: 1, processing: 1, date_start: 'date', date_finish: 'date' }
    }

    expect(handleBatchPayload(payload)).toBe(payload)
  })

  it('should throw when getting errors in payload', () => {
    const payload = {
      result: {
        result: { one: 'done' },
        result_error: { one: 'Expected error for `handleBatchPayload`' },
        result_next: [],
        result_time: [],
        result_total: []
      },
      time: { start: 1, finish: 1, duration: 1, processing: 1, date_start: 'date', date_finish: 'date' }
    }

    expect(() => handleBatchPayload(payload)).toThrowErrorMatchingSnapshot()
  })

  it('should throw when getting errors in numbered commands payload', () => {
    const payload = {
      result: {
        result: ['done'],
        result_error: ['Expected error for `handleBatchPayload`'],
        result_next: [],
        result_time: [],
        result_total: []
      },
      time: { start: 1, finish: 1, duration: 1, processing: 1, date_start: 'date', date_finish: 'date' }
    }

    expect(() => handleBatchPayload(payload)).toThrowErrorMatchingSnapshot()
  })
})

const TEST_URI = 'https://test.com/rest'
const batch = prepareBatch(got.extend({ baseUrl: TEST_URI, json: true }))
const RESPONSE_200 = 200

describe('Bitrix `batch` method', () => {
  it('should form a proper request', async () => {
    const payload = { result: { result: { one: 'done', two: 'done' }, result_error: [] } }
    const dealId = 999

    const commands = {
      one: { method: BitrixMethod.GET_DEAL, params: { ID: dealId } },
      two: { method: BitrixMethod.LIST_DEALS }
    }

    const scope = nock(TEST_URI)
      .get(`/${BitrixMethod.BATCH}`)
      .query({ one: `${commands.one.method}?ID=${dealId}`, two: commands.two.method })
      .reply(RESPONSE_200, payload)

    await batch(commands)

    expect(scope.done()).toBe(undefined)
  })

  it('should form a proper request with numbered commands', async () => {
    const payload = { result: { result: ['done1', 'done2'], result_error: [] } }
    const dealId = 999

    const commands = {
      0: { method: BitrixMethod.GET_DEAL, params: { ID: dealId } },
      1: { method: BitrixMethod.LIST_DEALS }
    }

    const scope = nock(TEST_URI)
      .get(`/${BitrixMethod.BATCH}`)
      .query({ 0: `${commands[0].method}?ID=${dealId}`, 1: commands[1].method })
      .reply(RESPONSE_200, payload)

    await batch(commands)

    expect(scope.done()).toBe(undefined)
  })

  it('should throw when passing more then max allowed per batch commands', () => {
    const commands = range(0, MAX_COMMANDS_PER_BATCH + 1)
      .reduce((comms, i) => ({ ...comms, [i]: BitrixMethod.LIST_DEALS }), {})

    return expect(batch(commands)).rejects.toMatchSnapshot()
  })

  it('should return body as payload', async () => {
    const commands = {
      0: { method: BitrixMethod.GET_DEAL },
      1: { method: BitrixMethod.LIST_DEALS }
    }

    const payload = { result: { result: ['done'], result_error: [] } }

    nock(TEST_URI)
      .get(`/${BitrixMethod.BATCH}`)
      .query({ 0: commands[0].method, 1: commands[1].method })
      .reply(RESPONSE_200, payload)

    expect(await batch(commands)).toEqual(payload)
  })

  it.todo('should cast payload to the <P>')

  it('should throw when getting errors in payload', () => {
    const payload = {
      result: {
        result: { one: 'done', two: 'done' },
        result_error: { one: 'Exptected error from numbered `batch` one', two: 'Exptected error from numbered `batch` two' }
      }
    }

    const commands = {
      one: { method: BitrixMethod.GET_DEAL },
      two: { method: BitrixMethod.LIST_DEALS }
    }

    nock(TEST_URI)
      .get(`/${BitrixMethod.BATCH}`)
      .query({ one: commands.one.method, two: commands.two.method })
      .reply(RESPONSE_200, payload)

    return expect(batch(commands)).rejects.toMatchSnapshot()
  })

  it('should throw when getting errors in numbered commands payload', () => {
    const payload = {
      result: {
        result: ['done'],
        result_error: ['Exptected error from numbered `batch` 0', 'Exptected error from numbered `batch` 1']
      }
    }

    const commands = {
      0: { method: BitrixMethod.GET_DEAL },
      1: { method: BitrixMethod.LIST_DEALS }
    }

    nock(TEST_URI)
      .get(`/${BitrixMethod.BATCH}`)
      .query({ 0: commands[0].method, 1: commands[1].method })
      .reply(RESPONSE_200, payload)

    return expect(batch(commands)).rejects.toMatchSnapshot()
  })
})
