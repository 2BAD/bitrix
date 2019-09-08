/* tslint-env jest */
// tslint:disable: no-expression-statement object-literal-sort-keys no-magic-numbers

import { Method } from '../../method.types'
import List, { batchToListPayload, fillWithCommands, highest } from './list'

describe('Client `fillWithCommands` method', () => {
  it('should fill array with required amount of commands to process all entries', () => {
    const command = { method: Method.CRM_DEAL_LIST, params: { select: ['*'] } }
    const start = 0
    const toProcess = 7
    const entriesPerCommand = 2

    expect(fillWithCommands(command, start, toProcess, entriesPerCommand)).toMatchSnapshot()
  })

  it('should properly take into account start', () => {
    const command = { method: Method.CRM_DEAL_LIST, params: { select: ['*'] } }
    const start = 2
    const toProcess = 7
    const entriesPerCommand = 2

    expect(fillWithCommands(command, start, toProcess, entriesPerCommand)).toMatchSnapshot()
  })

  it('should override `params.start`', () => {
    const wrongStart = 99
    const command = { method: Method.CRM_DEAL_LIST, params: { start: wrongStart } }
    const start = 0
    const toProcess = 2
    const entriesPerCommand = 1
    const commands = fillWithCommands(command, start, toProcess, entriesPerCommand)

    expect(Object.values(commands).map((c) => c.params)).toMatchSnapshot()
  })
})

describe('Client `highest` method', () => {
  it('should get highest value from object', () => {
    expect(highest({ a: undefined })).toBe(undefined)
    expect(highest({ a: undefined, b: undefined })).toBe(undefined)
    expect(highest({ a: 1, b: undefined })).toBe(1)
    expect(highest({ a: undefined, b: 1 })).toBe(1)
    expect(highest({ a: 1, b: 2 })).toBe(2)
    expect(highest({ a: 2, b: 1 })).toBe(2)
  })

  it('should get highest value from array', () => {
    expect(highest([undefined])).toBe(undefined)
    expect(highest([undefined, undefined])).toBe(undefined)
    expect(highest([1, undefined])).toBe(1)
    expect(highest([undefined, 1])).toBe(1)
    expect(highest([1, 2])).toBe(2)
    expect(highest([2, 1])).toBe(2)
  })
})

describe('Client `batchToListPayload` method', () => {
  it('should convert batch with named payloads to a list payload', () => {
    const payload = {
      result: {
        result: {
          a: [{ ID: '1' }, { ID: '2' }],
          b: [{ ID: '3' }, { ID: '4' }]
        },
        result_error: { a: 'Expected error A', b: 'Expected error B' },
        result_total: { a: 4, b: 4 },
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

    expect(batchToListPayload(payload)).toMatchSnapshot()
  })

  it('should convert batch with payload of arrays to a list payload', () => {
    const payload = {
      result: {
        result: [
          [{ ID: '1' }, { ID: '2' }],
          [{ ID: '3' }, { ID: '4' }]
        ],
        result_error: ['Expected error 1', 'Expected error 2'],
        result_total: [4, 4],
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

    expect(batchToListPayload(payload)).toMatchSnapshot()
  })

  it('should handle undefined in `result`', () => {
    const payload = {
      result: {
        result: [undefined, [{ ID: '1' }], undefined] as any,
        result_error: [] as any,
        result_total: [] as any,
        result_next: [] as any,
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

    expect(batchToListPayload(payload)).toMatchSnapshot()
  })
})

describe('Client `list` method', () => {
  it('should make one request when entries can be fetched in one go', async () => {
    const callMock = jest.fn(() => Promise.resolve({ next: false }) as any)
    const batchMock = jest.fn(() => Promise.resolve({}) as any)
    const list = List({ call: callMock, batch: batchMock })

    await list(Method.CRM_DEAL_LIST, {})

    expect(callMock.mock.calls).toMatchSnapshot()
    expect(batchMock).not.toBeCalled()
  })

  it('should make multiple requests when entries can not be fetched in one go', async () => {
    const callMock = jest.fn(() => Promise.resolve({ next: 2, total: 120 }) as any)
    const batchMock = jest.fn(() => Promise.resolve({
      result: {
        result: ['done'],
        result_error: [],
        result_next: [],
        result_time: [],
        result_total: []
      },
      time: {}
    }) as any)
    const list = List({ call: callMock, batch: batchMock })

    await list(Method.CRM_DEAL_LIST, {})

    expect(callMock.mock.calls).toMatchSnapshot()
    expect(batchMock.mock.calls).toMatchSnapshot()
  })

  it('should return a first request payload when entities can be fetched in a single request', async () => {
    const mockPayload = { next: false, result: 'test' }
    const callMock = jest.fn(() => Promise.resolve(mockPayload) as any)
    const batchMock = jest.fn(() => Promise.resolve({}) as any)
    const list = List({ call: callMock, batch: batchMock })

    const payload = await list(Method.CRM_DEAL_LIST, {})

    expect(payload).toEqual(mockPayload)
  })

  it('should return a flatten payload when entities can not be fetched in a single request', async () => {
    const mockPayload = {
      result: {
        result: {
          a: [{ ID: '1' }, { ID: '2' }],
          b: [{ ID: '3' }, { ID: '4' }]
        },
        result_error: { a: 'Expected error A', b: 'Expected error B' },
        result_total: { a: 4, b: 4 },
        result_next: { a: 2, b: 4 },
        result_time: {
          a: { start: 1567196891.008149 },
          b: { start: 1567196891.022316 }
        }
      },
      time: { start: 1567196890.959017 }
    }

    const callMock = jest.fn(() => Promise.resolve({ next: 2 }) as any)
    const batchMock = jest.fn(() => Promise.resolve(mockPayload) as any)
    const list = List({ call: callMock, batch: batchMock })

    const payload = await list(Method.CRM_DEAL_LIST, {})

    expect(payload).toMatchSnapshot()
  })

  it('should default start to 0', async () => {
    const callMock = jest.fn(() => Promise.resolve({ next: 2, total: 20 }) as any)
    const batchMock = jest.fn(() => Promise.resolve({
      result: {
        result: ['done'],
        result_error: [],
        result_next: [],
        result_time: [],
        result_total: []
      },
      time: {}
    }) as any)
    const list = List({ call: callMock, batch: batchMock })

    await list(Method.CRM_DEAL_LIST, {})

    expect(callMock.mock.calls[0]).toMatchSnapshot()
    expect(batchMock.mock.calls[0]).toMatchSnapshot()
  })

  it('should properly take into account start', async () => {
    const callMock = jest.fn(() => Promise.resolve({ next: 2, total: 120 }) as any)
    const batchMock = jest.fn(() => Promise.resolve({
      result: {
        result: ['done'],
        result_error: [],
        result_next: [],
        result_time: [],
        result_total: []
      },
      time: {}
    }) as any)
    const list = List({ call: callMock, batch: batchMock })

    await list(Method.CRM_DEAL_LIST, { start: 27 })

    expect(callMock.mock.calls).toMatchSnapshot()
    expect(batchMock.mock.calls).toMatchSnapshot()
  })

  it.todo('should cast first request payload to the <P>')
  it.todo('should cast payload results to the <P>')
})
