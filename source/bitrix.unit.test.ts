import { describe, expect, it, vi } from 'vitest'
import Bitrix from './bitrix.js'
import * as client from './client/index.js'

describe('Bitrix', () => {
  it('should init', () => {
    expect(() => Bitrix('https://test.com', 'test_token')).not.toThrow()
  })

  it('should pass endpoint and access token to the client', () => {
    const SpiedClient = vi.spyOn(client, 'default')

    Bitrix('https://test.com', 'test_token')
    expect(SpiedClient.mock.calls).toMatchSnapshot()
  })

  it('should expose API methods', () => {
    const bitrix = Bitrix('https://test.com', 'test_token')
    expect(bitrix).toMatchSnapshot()
  })
})
