/* eslint-env jest */
// tslint:disable: no-expression-statement

import got from 'got'
import nock from 'nock'
import { BitrixMethod } from '../types'
import prepareGet from './get'

const TEST_URI = 'https://test.com/rest'
const get = prepareGet(got.extend({ baseUrl: TEST_URI }))
const RESPONSE_200 = 200

describe('Bitrix `get` method', () => {
  it('should form a proper request', async () => {
    const query = { test: 1 }

    const scope = nock(TEST_URI)
      .get(`/${BitrixMethod.GET_DEAL}`)
      .query(query)
      .reply(RESPONSE_200)

    await get(BitrixMethod.GET_DEAL, query)

    expect(scope.done()).toBe(undefined)
  })

  it('should return body as payload', async () => {
    const payload = { test: 'value' }

    nock(TEST_URI)
      .get(`/${BitrixMethod.GET_DEAL}`)
      .reply(RESPONSE_200, payload)

    // @todo For some reason nock returns payload as a stringified object. Need to check
    const result: any = await get(BitrixMethod.GET_DEAL)

    expect(JSON.parse(result)).toEqual(payload)
  })

  it.todo('should cast payload to the <P>')
})
