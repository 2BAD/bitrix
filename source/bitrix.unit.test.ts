/* tslint-env jest */
// tslint:disable: no-expression-statement

import Bitrix from './bitrix'
import * as client from './client'

describe('Bitrix', () => {
  it('should init', () => {
    expect(() => Bitrix('https://test.com', 'test_token')).not.toThrow()
  })

  it('should pass endpoint and acccess token to the client', () => {
    const SpiedClient = jest.spyOn(client, 'default')

    Bitrix('https://test.com', 'test_token')
    expect(SpiedClient.mock.calls).toMatchSnapshot()
  })

  it('should expose API methods', () => {
    const bitrix = Bitrix('https://test.com', 'test_token')
    expect(bitrix).toMatchSnapshot()
  })
})
