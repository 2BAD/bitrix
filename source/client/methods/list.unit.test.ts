/* eslint-env jest */
// tslint:disable: no-expression-statement

describe('Bitrix `fillBatchCommands` method', () => {
  it.todo('should return dict of batch commands')
  it.todo('should properly calculate required amount of commands to finish the queue')
  it.todo('should properly take into account start')
  it.todo('should return specified amount of batch commands when given less than max allowed per batch commands')
  it.todo('should return max allowed per batch when given more than max allowed per batch commands')
})

describe('Bitrix `fillBatchesCommands` method', () => {
  it.todo('should return array of dicts of batch commands')
  it.todo('should properly calculate required amount of batches to finish the queue')
  it.todo('should properly calculate required amount of batches commands to finish the queue')
  it.todo('should properly take into account start')
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
