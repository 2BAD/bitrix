import { BeforeRequestHook } from 'got'

/**
 * Got can't merge `query` option with other queries if they are string. But that hook can.
 */
export default (accessToken?: string): BeforeRequestHook => (options) => {
  if (!accessToken) return
  if (!options.url) return

  options.url.search = `${options.url.search}${options.url.search ? '&' : '?'}access_token=${accessToken}`
}
