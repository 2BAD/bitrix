/* tslint-env jest */
// tslint:disable: no-expression-statement

import nock from 'nock'
import { Method } from '../method.types'
import Client from './index'

const TEST_URI = 'https://test.com/rest'
const TEST_ACCESS_TOKEN = 'test_access_token'
const RESPONSE_200 = 200

const queueAdd = jest.fn((fn: any) => Promise.resolve(fn()))

const Queue = jest.fn().mockImplementation(() => {
  return {
    add: queueAdd
  }
})

const client = Client(TEST_URI, TEST_ACCESS_TOKEN, Queue as any)

describe('Client', () => {
  beforeEach(() => {
    queueAdd.mockClear()
  })

  describe('`call`', () => {
    it('should add to queue', async () => {
      const payload = {}
      const method = Method.LIST_DEALS

      nock(TEST_URI)
        .get(`/${method}?access_token=${TEST_ACCESS_TOKEN}`)
        .reply(RESPONSE_200, payload)
        .get(`/${method}?access_token=${TEST_ACCESS_TOKEN}`)
        .reply(RESPONSE_200, payload)

      await client.call(method, {})
      await client.call(method, {})

      expect(queueAdd.mock.calls).toMatchSnapshot()
    })
  })

  describe('`batch`', () => {
    it('should add to queue', async () => {
      const payload = {
        result: {
          result: ['done'],
          result_error: []
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
        .get(`/${Method.BATCH}?cmd%5B0%5D=${commands[0].method}&access_token=${TEST_ACCESS_TOKEN}`)
        .reply(RESPONSE_200, payload)
        .get(`/${Method.BATCH}?cmd%5B0%5D=${commands[1].method}&access_token=${TEST_ACCESS_TOKEN}`)
        .reply(RESPONSE_200, payload)

      await client.batch(commands, 1)

      expect(queueAdd.mock.calls).toMatchSnapshot()
    })
  })
})
