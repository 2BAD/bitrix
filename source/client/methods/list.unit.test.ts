import { Method } from '../../types'
import { fillWithCommands } from './list'

/* eslint-env jest */
// tslint:disable: no-expression-statement

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
