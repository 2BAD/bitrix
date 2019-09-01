/* eslint-env jest */
// tslint:disable: no-expression-statement object-literal-sort-keys no-magic-numbers

import got from 'got'
import nock from 'nock'
import { Method } from '../../types'
import Batch, {
  chunkCommands,
  handleBatchPayload,
  mergeBatchPayloads,
  prepareCommandsQueries
} from './batch'

describe('Bitrix `chunkCommands` method', () => {
  it('should chunk named commands', () => {
    const chunkSize = 2
    const commands = {
      a: { method: Method.GET_DEAL },
      b: { method: Method.GET_LEAD },
      c: { method: Method.LIST_DEALS },
      d: { method: Method.LIST_LEADS },
      e: { method: Method.LIST_STATUSES }
    }

    expect(chunkCommands(commands, chunkSize)).toMatchSnapshot()
  })

  it('should chunk array of commands', () => {
    const chunkSize = 2
    const commands = [
      { method: Method.GET_DEAL },
      { method: Method.GET_LEAD },
      { method: Method.LIST_DEALS },
      { method: Method.LIST_LEADS },
      { method: Method.LIST_STATUSES }
    ] as const

    expect(chunkCommands(commands, chunkSize)).toMatchSnapshot()
  })
})

describe('Bitrix `prepareCommandsQueries` method', () => {
  it('should transform dict of the commands into the query object', () => {
    const testDealId = 11111

    const commands = {
      one: {
        method: Method.GET_DEAL,
        params: { ID: testDealId }
      },
      two: {
        method: Method.LIST_DEALS,
        params: {
          filter: { '>PROBABILITY': 50 },
          order: { STAGE_ID: 'ASC' },
          select: ['ID', 'TITLE'],
          start: 200
        }
      }
    }

    expect(prepareCommandsQueries(commands)).toMatchSnapshot()
  })

  it('should work with numbered commands', () => {
    const commands = {
      0: { method: Method.GET_DEAL },
      1: { method: Method.LIST_DEALS }
    }

    expect(prepareCommandsQueries(commands)).toMatchSnapshot()
  })

  it('should work with array of commands', () => {
    const commands = [
      { method: Method.GET_DEAL },
      { method: Method.LIST_DEALS }
    ] as const

    expect(prepareCommandsQueries(commands)).toMatchSnapshot()
  })

  it('should return empty query object when no commands provided', () => {
    expect(prepareCommandsQueries({})).toMatchSnapshot()
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

describe('Bitrix `mergeBatchPayloads` method', () => {
  it('should merge named payloads', () => {
    const batch1 = {
      result: {
        result: {
          a: [{ ID: '1' }, { ID: '2' }],
          b: [{ ID: '3' }, { ID: '4' }]
        },
        result_error: [],
        result_total: { a: 8, b: 8 },
        result_next: { a: 2, b: 4 },
        result_time: {
          a: {
            start: 1567196891.008149,
            finish: 1567196891.022234,
            duration: 0.014085054397583008,
            processing: 0.013998985290527344,
            date_start: '2019-08-30T23:28:11+03:00',
            date_finish: '2019-08-30T23:28:11+03:00'
          },
          b: {
            start: 1567196891.022316,
            finish: 1567196891.03225,
            duration: 0.009933948516845703,
            processing: 0.009846210479736328,
            date_start: '2019-08-30T23:28:11+03:00',
            date_finish: '2019-08-30T23:28:11+03:00'
          }
        }
      },
      time: {
        start: 1567196890.959017,
        finish: 1567196891.223739,
        duration: 0.2647218704223633,
        processing: 0.21567082405090332,
        date_start: '2019-08-30T23:28:10+03:00',
        date_finish: '2019-08-30T23:28:11+03:00'
      }
    }

    const batch2 = {
      result: {
        result: {
          c: [{ ID: '5' }, { ID: '6' }],
          d: [{ ID: '7' }, { ID: '8' }]
        },
        result_error: [],
        result_total: { c: 8, d: 8 },
        result_next: { c: 6, d: 8 },
        result_time: {
          c: {
            start: 1567196891.032315,
            finish: 1567196891.035297,
            duration: 0.002981901168823242,
            processing: 0.002897024154663086,
            date_start: '2019-08-30T23:28:11+03:00',
            date_finish: '2019-08-30T23:28:11+03:00'
          },
          d: {
            start: 1567196891.03536,
            finish: 1567196891.039936,
            duration: 0.004575967788696289,
            processing: 0.00450897216796875,
            date_start: '2019-08-30T23:28:11+03:00',
            date_finish: '2019-08-30T23:28:11+03:00'
          }
        }
      },
      time: {
        start: 1567196890.959517,
        finish: 1567196891.225739,
        duration: 0.2647218704223683,
        processing: 0.21567082405090832,
        date_start: '2019-08-30T23:28:12+03:00',
        date_finish: '2019-08-30T23:28:13+03:00'
      }
    }

    expect(mergeBatchPayloads([batch1, batch2])).toMatchSnapshot()
  })

  it('should merge array payloads', () => {
    const batch1 = {
      result: {
        result: [
          [{ ID: '1' }, { ID: '2' }],
          [{ ID: '3' }, { ID: '4' }]
        ],
        result_error: [],
        result_total: [8, 8],
        result_next: [2, 4],
        result_time: [{
          start: 1567196891.008149,
          finish: 1567196891.022234,
          duration: 0.014085054397583008,
          processing: 0.013998985290527344,
          date_start: '2019-08-30T23:28:11+03:00',
          date_finish: '2019-08-30T23:28:11+03:00'
        }, {
          start: 1567196891.022316,
          finish: 1567196891.03225,
          duration: 0.009933948516845703,
          processing: 0.009846210479736328,
          date_start: '2019-08-30T23:28:11+03:00',
          date_finish: '2019-08-30T23:28:11+03:00'
        }]
      },
      time: {
        start: 1567196890.959017,
        finish: 1567196891.223739,
        duration: 0.2647218704223633,
        processing: 0.21567082405090332,
        date_start: '2019-08-30T23:28:10+03:00',
        date_finish: '2019-08-30T23:28:11+03:00'
      }
    }

    const batch2 = {
      result: {
        result: [
          [{ ID: '5' }, { ID: '6' }],
          [{ ID: '7' }, { ID: '8' }]
        ],
        result_error: [],
        result_total: [8, 8],
        result_next: [6, 8],
        result_time: [{
          start: 1567196891.032315,
          finish: 1567196891.035297,
          duration: 0.002981901168823242,
          processing: 0.002897024154663086,
          date_start: '2019-08-30T23:28:11+03:00',
          date_finish: '2019-08-30T23:28:11+03:00'
        }, {
          start: 1567196891.03536,
          finish: 1567196891.039936,
          duration: 0.004575967788696289,
          processing: 0.00450897216796875,
          date_start: '2019-08-30T23:28:11+03:00',
          date_finish: '2019-08-30T23:28:11+03:00'
        }]
      },
      time: {
        start: 1567196890.959517,
        finish: 1567196891.225739,
        duration: 0.2647218704223683,
        processing: 0.21567082405090832,
        date_start: '2019-08-30T23:28:12+03:00',
        date_finish: '2019-08-30T23:28:13+03:00'
      }
    }

    expect(mergeBatchPayloads([batch1, batch2])).toMatchSnapshot()
  })
})

const TEST_URI = 'https://test.com/rest'
const batch = Batch(got.extend({ baseUrl: TEST_URI, json: true }))
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
      //       fails to match request when it contains `cmd[someName]`. The issue definitely connected
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
    } as const

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
      { method: Method.GET_DEAL, params: { ID: dealId } },
      { method: Method.LIST_DEALS }
    ] as const

    const scope = nock(TEST_URI)
      // @todo We'd want to use `query` object here as it is much more readable, but nock for some reason
      //       fails to match request when it contains `cmd[someName]`. The issue definitely
      //       connected to the `[]` since it does not appear when only one bracket present
      .get(`/${Method.BATCH}?cmd%5B0%5D=${commands[0].method}%3FID%3D${dealId}&cmd%5B1%5D=${commands[1].method}`)
      .reply(RESPONSE_200, payload)

    await batch(commands)

    expect(scope.done()).toBe(undefined)
  })

  it('should form a proper requests with more than max allowed commands per batch', async () => {
    const maxCommandsPerBatch = 1
    const payload = { result: { result: { one: 'done', two: 'done' }, result_error: [] } }
    const dealId = 999

    const commands = {
      one: { method: Method.GET_DEAL, params: { ID: dealId } },
      two: { method: Method.LIST_DEALS }
    }

    const scope = nock(TEST_URI)
      // @todo We'd want to use `query` object here as it is much more readable, but nock for some reason
      //       fails to match request when it contains `cmd[someName]`. The issue definitely connected
      //       to the `[]`, since it does not appear when only one bracket present
      .get(
        `/${Method.BATCH}?cmd%5Bone%5D=${commands.one.method}%3FID%3D${dealId}`
      )
      .reply(RESPONSE_200, payload)
      .get(
        `/${Method.BATCH}?cmd%5Btwo%5D=${commands.two.method}`
      )
      .reply(RESPONSE_200, payload)

    await batch(commands, maxCommandsPerBatch)

    expect(scope.done()).toBe(undefined)
  })

  it('should form a proper request with more than allowed max numbered commands', async () => {
    const maxCommandsPerBatch = 1
    const payload = { result: { result: ['done1', 'done2'], result_error: [] } }
    const dealId = 999

    const commands = {
      0: { method: Method.GET_DEAL, params: { ID: dealId } },
      1: { method: Method.LIST_DEALS }
    } as const

    const scope = nock(TEST_URI)
      // @todo We'd want to use `query` object here as it is much more readable, but nock for some reason
      //       fails to match request when it contains `cmd[someName]`. The issue definitely
      //       connected to the `[]` since it does not appear when only one bracket present
      .get(`/${Method.BATCH}?cmd%5B0%5D=${commands[0].method}%3FID%3D${dealId}`)
      .reply(RESPONSE_200, payload)
      .get(`/${Method.BATCH}?cmd%5B1%5D=${commands[1].method}`)
      .reply(RESPONSE_200, payload)

    await batch(commands, maxCommandsPerBatch)

    expect(scope.done()).toBe(undefined)
  })

  it('should form a proper request with more than max allowed array of commands', async () => {
    const maxCommandsPerBatch = 1
    const payload = { result: { result: ['done1', 'done2'], result_error: [] } }
    const dealId = 999

    const commands = [
      { method: Method.GET_DEAL, params: { ID: dealId } },
      { method: Method.LIST_DEALS }
    ] as const

    const scope = nock(TEST_URI)
      // @todo We'd want to use `query` object here as it is much more readable, but nock for some reason
      //       fails to match request when it contains `cmd[someName]`. The issue definitely
      //       connected to the `[]` since it does not appear when only one bracket present
      .get(`/${Method.BATCH}?cmd%5B0%5D=${commands[0].method}%3FID%3D${dealId}`)
      .reply(RESPONSE_200, payload)
      .get(`/${Method.BATCH}?cmd%5B0%5D=${commands[1].method}`)
      .reply(RESPONSE_200, payload)

    await batch(commands, maxCommandsPerBatch)

    expect(scope.done()).toBe(undefined)
  })

  it('should return body as payload', async () => {
    const commands = {
      0: { method: Method.GET_DEAL },
      1: { method: Method.LIST_DEALS }
    }

    const payload = {
      result: {
        result: ['done'],
        result_error: [],
        result_next: [],
        result_time: [],
        result_total: []
      },
      time: {}
    }

    nock(TEST_URI)
      // @todo We'd want to use `query` object here as it is much more readable, but nock for some reason
      //       fails to match request when it contains `cmd[someName]`. The issue definitely connected
      //       to the `[]`, since it does not appear when only one bracket present
      .get(`/${Method.BATCH}?cmd%5B0%5D=${commands[0].method}&cmd%5B1%5D=${commands[1].method}`)
      .reply(RESPONSE_200, payload)

    expect(await batch(commands)).toEqual(payload)
  })

  // @todo Test this also for named and numbered commands
  it('should merge payloads when more then max allowed commands provided', async () => {
    const maxAllowedCommands = 1
    const commands = {
      0: { method: Method.GET_DEAL },
      1: { method: Method.LIST_DEALS }
    }

    const payload1 = {
      result: {
        result: ['done1'],
        result_error: [],
        result_next: [1],
        result_time: [],
        result_total: [2]
      },
      time: {}
    }

    const payload2 = {
      result: {
        result: ['done2'],
        result_error: [],
        result_next: [2],
        result_time: [],
        result_total: [2]
      },
      time: {}
    }

    nock(TEST_URI)
      // @todo We'd want to use `query` object here as it is much more readable, but nock for some reason
      //       fails to match request when it contains `cmd[someName]`. The issue definitely connected
      //       to the `[]`, since it does not appear when only one bracket present
      .get(`/${Method.BATCH}?cmd%5B0%5D=${commands[0].method}`)
      .reply(RESPONSE_200, payload1)
      .get(`/${Method.BATCH}?cmd%5B1%5D=${commands[1].method}`)
      .reply(RESPONSE_200, payload2)

    expect(await batch(commands, maxAllowedCommands)).toMatchSnapshot()
  })

  it.todo('should cast payload to the <P>')

  it('should throw when getting errors in payload', () => {
    const payload = {
      result: {
        result: { one: 'done', two: 'done' },
        result_error: {
          one: 'Expected error from numbered `batch` one',
          two: 'Expected error from numbered `batch` two'
        }
      }
    }

    const commands = {
      one: { method: Method.GET_DEAL },
      two: { method: Method.LIST_DEALS }
    }

    nock(TEST_URI)
      // @todo We'd want to use `query` object here as it is much more readable, but nock for some reason
      //       fails to match request when it contains `cmd[someName]`. The issue definitely connected
      //       to the `[]`, since it does not appear when only one bracket present
      .get(`/${Method.BATCH}?cmd%5Bone%5D=${commands.one.method}&cmd%5Btwo%5D=${commands.two.method}`)
      .reply(RESPONSE_200, payload)

    return expect(batch(commands)).rejects.toMatchSnapshot()
  })

  it('should throw when getting errors in numbered commands payload', () => {
    const payload = {
      result: {
        result: ['done'],
        result_error: ['Expected error from numbered `batch` 0', 'Expected error from numbered `batch` 1']
      }
    }

    const commands = {
      0: { method: Method.GET_DEAL },
      1: { method: Method.LIST_DEALS }
    }

    nock(TEST_URI)
      // @todo We'd want to use `query` object here as it is much more readable, but nock for some reason
      //       fails to match request when it contains `cmd[someName]`. The issue definitely connected
      //       to the `[]`, since it does not appear when only one bracket present
      .get(`/${Method.BATCH}?cmd%5B0%5D=${commands[0].method}&cmd%5B1%5D=${commands[1].method}`)
      .reply(RESPONSE_200, payload)

    return expect(batch(commands)).rejects.toMatchSnapshot()
  })

  it('should throw when getting errors in array of commands payload', () => {
    const payload = {
      result: {
        result: ['done'],
        result_error: ['Expected error from array of command `batch` 0', 'Expected error from array of command `batch` 1']
      }
    }

    const commands = [
      { method: Method.GET_DEAL },
      { method: Method.LIST_DEALS }
    ] as const

    nock(TEST_URI)
      // @todo We'd want to use `query` object here as it is much more readable, but nock for some reason
      //       fails to match request when it contains `cmd[someName]`. The issue definitely connected
      //       to the `[]`, since it does not appear when only one bracket present
      .get(`/${Method.BATCH}?cmd%5B0%5D=${commands[0].method}&cmd%5B1%5D=${commands[1].method}`)
      .reply(RESPONSE_200, payload)

    return expect(batch(commands)).rejects.toMatchSnapshot()
  })
})
