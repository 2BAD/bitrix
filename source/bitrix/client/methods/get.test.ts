/* eslint-env jest */
// tslint:disable: no-expression-statement

import got from 'got'
import nock from 'nock'
import { Method } from '../../types'
import Get from './get'

const TEST_URI = 'https://test.com/rest'
const get = Get(got.extend({ baseUrl: TEST_URI, json: true }))
const RESPONSE_200 = 200

describe('Bitrix `get` method', () => {
  it('should form a proper request', async () => {
    const query = { test: 1 }

    const scope = nock(TEST_URI)
      .get(`/${Method.GET_DEAL}`)
      .query(query)
      .reply(RESPONSE_200)

    await get(Method.GET_DEAL, query)

    expect(scope.done()).toBe(undefined)
  })

  it('should return body as payload', async () => {
    const payload = { test: 'value' }

    nock(TEST_URI)
      .get(`/${Method.GET_DEAL}`)
      .reply(RESPONSE_200, payload)

    expect(await get(Method.GET_DEAL)).toEqual(payload)
  })

  it.todo('should cast payload to the <P>')
})
