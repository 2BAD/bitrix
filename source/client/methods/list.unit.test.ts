/* eslint-env jest */
// tslint:disable: no-expression-statement object-literal-sort-keys no-magic-numbers

import { Method } from '../../types'
import { batchToListPayload, fillWithCommands } from './list'

describe('Bitrix `fillWithCommands` method', () => {
  it('should fill array with required amount of commands to process all entries', () => {
    const command = { method: Method.LIST_DEALS, params: { select: ['*'] } }
    const start = 0
    const toProcess = 7
    const entriesPerCommand = 2

    expect(fillWithCommands(command, start, toProcess, entriesPerCommand)).toMatchSnapshot()
  })

  it('should properly take into account start', () => {
    const command = { method: Method.LIST_DEALS, params: { select: ['*'] } }
    const start = 2
    const toProcess = 7
    const entriesPerCommand = 2

    expect(fillWithCommands(command, start, toProcess, entriesPerCommand)).toMatchSnapshot()
  })

  it('should override `params.start`', () => {
    const wrongStart = 99
    const command = { method: Method.LIST_DEALS, params: { start: wrongStart } }
    const start = 0
    const toProcess = 2
    const entriesPerCommand = 1
    const commands = fillWithCommands(command, start, toProcess, entriesPerCommand)

    expect(Object.values(commands).map((c) => c.params)).toMatchSnapshot()
  })
})

describe('Bitrix `batchToListPayload` method', () => {
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
})

describe('Bitrix `list` method', () => {
  it.todo('should form a proper first request')
  it.todo('should properly take into account start')
  it.todo('should return a first request payload when entities can be fetched in single request')
  it.todo('should cast first request payload to the <P>')
  it.todo('should form proper requests when entities can not be fetched in single request')
  it.todo('should properly take into account start when forming multiple requests')
  it.todo('should return flattened batches payloads')
  it.todo('should throw when getting errors in batches payloads')
  it.todo('should cast payload results to the <P>')
})
