import got from 'got'
import addAccessToken from './addAccessToken'

const token = 'mock_token'
const merge = got.mergeOptions

describe('Client `addAccessToken` hook', () => {
  it('should add access token to URL without a query', () => {
    const options = merge({ path: 'test', responseType: 'json' } as const)

    addAccessToken(token)(options)

    expect(options.path).toBe(`test?access_token=${token}`)
  })

  it('should add access token to URL with a query', () => {
    const options = merge({ path: 'test?value=1', responseType: 'json' } as const)

    addAccessToken(token)(options)

    expect(options.path).toBe(`test?value=1&access_token=${token}`)
  })

  it('should not add access token when it is undefined', () => {
    const options = merge({ path: 'test', responseType: 'json' } as const)

    addAccessToken()(options)

    expect(options.path).toBe('test')
  })

  it('should not add access token when URL is undefined', () => {
    const options = merge({ path: undefined, responseType: 'json' } as const)

    addAccessToken(token)(options)

    expect(options.path).toBe(undefined)
  })
})
