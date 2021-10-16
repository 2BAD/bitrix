import got from 'got'
import nock from 'nock'
import Queue from 'p-queue'
import { Method } from '../methods'
import Client from './index'

const TEST_URI = 'https://test.com/rest'
const TEST_ACCESS_TOKEN = 'test_access_token'
const RESPONSE_200 = 200
const spiedQueueAdd = jest.spyOn(Queue.prototype, 'add')
const client = Client(TEST_URI, TEST_ACCESS_TOKEN)

describe('Client', () => {
  beforeEach(() => {
    spiedQueueAdd.mockClear()
  })

  it('should init', () => {
    expect(() => Client(TEST_URI, TEST_ACCESS_TOKEN)).not.toThrow()
  })

  it('should extend `Got` instance with a specified parameters', () => {
    const spiedGotExtend = jest.spyOn(got, 'extend')

    Client('https://test.com', 'test_token', {https: { rejectUnauthorized: false }})
    expect(spiedGotExtend.mock.calls).toMatchSnapshot()
  })

  it('should expose API methods', () => {
    expect(client).toMatchSnapshot()
  })

  describe('`call`', () => {
    // @todo restore test when issue is resolved (https://github.com/nock/nock/issues/1832)
    it.skip('should add to queue', async () => {
      const payload = {}
      const method = Method.CRM_DEAL_LIST

      nock(TEST_URI)
        .get(`/${method}?access_token=${TEST_ACCESS_TOKEN}`)
        .twice()
        .reply(RESPONSE_200, payload)

      await client.call(method, {})
      await client.call(method, {})

      expect(spiedQueueAdd.mock.calls).toMatchSnapshot()
    })
  })

  describe('`batch`', () => {
    // @todo restore test when issue is resolved (https://github.com/nock/nock/issues/1832)
    it.skip('should add to queue', async () => {
      const payload = {
        result: {
          result: ['done'],
          result_error: []
        }
      }

      const commands = [
        { method: Method.CRM_DEAL_GET },
        { method: Method.CRM_DEAL_LIST }
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

      expect(spiedQueueAdd.mock.calls).toMatchSnapshot()
    })
  })
})
