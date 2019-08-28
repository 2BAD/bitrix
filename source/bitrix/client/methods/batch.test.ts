/* eslint-env jest */
// tslint:disable: no-expression-statement

import got from 'got'
import range from 'lodash.range'
import nock from 'nock'
import { Method } from '../../types'
import prepareBatch, { commandsToBatchQuery, handleBatchPayload, MAX_COMMANDS_PER_BATCH } from './batch'

describe('Bitrix `commandsToBatchQuery` method', () => {
  it('should transform dict of the commands into the query object', () => {
    const testDealId = 11111

    const commands = {
      one: {
        method: Method.GET_DEAL,
        params: { ID: testDealId }
      },
      two: {
        method: Method.LIST_DEALS
      }
    }

    expect(commandsToBatchQuery(commands)).toMatchSnapshot()
  })

  it('should work with numbered commands', () => {
    const commands = {
      0: { method: Method.GET_DEAL },
      1: { method: Method.LIST_DEALS }
    }

    expect(commandsToBatchQuery(commands)).toMatchSnapshot()
  })

  it('should work with array of commands', () => {
    const commands = [
      { method: BitrixMethod.GET_DEAL },
      { method: BitrixMethod.LIST_DEALS }
    ] as const

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

  it('should return payload of array batch', () => {
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
      one: { method: Method.GET_DEAL, params: { ID: dealId } },
      two: { method: Method.LIST_DEALS }
    }

    const scope = nock(TEST_URI)
      // @todo We'd want to use `query` object here as it is much more readable, but nock for some reason
      //       fails to match request when it contains `cmd[someName]`. The issue definately connected
      //       to the `[]`, since it does not appear when only one bracket present
      .get(
        `/${Method.BATCH}?cmd%5Bone%5D=${commands.one.method}%3FID%3D${dealId}&cmd%5Btwo%5D=${commands.two.method}`
      )
      .reply(RESPONSE_200, payload)

    await batch(commands)

    expect(scope.done()).toBe(undefined)
  })

  it('should form a proper request with numbered commands', async () => {
    const payload = { result: { result: ['done1', 'done2'], result_error: [] } }
    const dealId = 999

    const commands = {
      0: { method: Method.GET_DEAL, params: { ID: dealId } },
      1: { method: Method.LIST_DEALS }
    }

    const scope = nock(TEST_URI)
      // @todo We'd want to use `query` object here as it is much more readable, but nock for some reason
      //       fails to match request when it contains `cmd[someName]`. The issue definitely
      //       connected to the `[]` since it does not appear when only one bracket present
      .get(`/${Method.BATCH}?cmd%5B0%5D=${commands[0].method}%3FID%3D${dealId}&cmd%5B1%5D=${commands[1].method}`)
      .reply(RESPONSE_200, payload)

    await batch(commands)

    expect(scope.done()).toBe(undefined)
  })

  it('should form a proper request with array of commands', async () => {
    const payload = { result: { result: ['done1', 'done2'], result_error: [] } }
    const dealId = 999

    const commands = [
      { method: BitrixMethod.GET_DEAL, params: { ID: dealId } },
      { method: BitrixMethod.LIST_DEALS }
    ] as const

    const scope = nock(TEST_URI)
      // @todo We'd want to use `query` object here as it is much more readable, but nock for some reason
      //       fails to match request when it contains `cmd[someName]`. The issue definitely
      //       connected to the `[]` since it does not appear when only one bracket present
      .get(`/${BitrixMethod.BATCH}?cmd%5B0%5D=${commands[0].method}%3FID%3D${dealId}&cmd%5B1%5D=${commands[1].method}`)
      .reply(RESPONSE_200, payload)

    await batch(commands)

    expect(scope.done()).toBe(undefined)
  })

  it('should throw when passing more then max allowed per batch commands', () => {
    const commands = range(0, MAX_COMMANDS_PER_BATCH + 1)
      .reduce((comms, i) => ({ ...comms, [i]: Method.LIST_DEALS }), {})

    return expect(batch(commands)).rejects.toMatchSnapshot()
  })

  it('should return body as payload', async () => {
    const commands = {
      0: { method: Method.GET_DEAL },
      1: { method: Method.LIST_DEALS }
    }

    const payload = { result: { result: ['done'], result_error: [] } }

    nock(TEST_URI)
      // @todo We'd want to use `query` object here as it is much more readable, but nock for some reason
      //       fails to match request when it contains `cmd[someName]`. The issue definately connected to the `[]`, since
      //       it does not appear when only one bracket present
      .get(`/${Method.BATCH}?cmd%5B0%5D=${commands[0].method}&cmd%5B1%5D=${commands[1].method}`)
      .reply(RESPONSE_200, payload)

    expect(await batch(commands)).toEqual(payload)
  })

  it.todo('should cast payload to the <P>')

  it('should throw when getting errors in payload', () => {
    const payload = {
      result: {
        result: { one: 'done', two: 'done' },
        result_error: {
          one: 'Exptected error from numbered `batch` one',
          two: 'Exptected error from numbered `batch` two'
        }
      }
    }

    const commands = {
      one: { method: Method.GET_DEAL },
      two: { method: Method.LIST_DEALS }
    }

    nock(TEST_URI)
      // @todo We'd want to use `query` object here as it is much more readable, but nock for some reason
      //       fails to match request when it contains `cmd[someName]`. The issue definately connected to the `[]`, since
      //       it does not appear when only one bracket present
      .get(`/${Method.BATCH}?cmd%5Bone%5D=${commands.one.method}&cmd%5Btwo%5D=${commands.two.method}`)
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
      0: { method: Method.GET_DEAL },
      1: { method: Method.LIST_DEALS }
    }

    nock(TEST_URI)
      // @todo We'd want to use `query` object here as it is much more readable, but nock for some reason
      //       fails to match request when it contains `cmd[someName]`. The issue definately connected to the `[]`, since
      //       it does not appear when only one bracket present
      .get(`/${Method.BATCH}?cmd%5B0%5D=${commands[0].method}&cmd%5B1%5D=${commands[1].method}`)
      .reply(RESPONSE_200, payload)

    return expect(batch(commands)).rejects.toMatchSnapshot()
  })
})
