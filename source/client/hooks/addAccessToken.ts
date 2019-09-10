import got from 'got'

/**
 * Got can't merge `query` option with other queries if they are string. But that hook can.
 */
export default (accessToken?: string) => (options: got.GotJSONOptions): void => {
  // tslint:disable-next-line: no-if-statement
  if (!accessToken) return
  // tslint:disable-next-line: no-if-statement
  if (!options.path) return

  const hasQuery = options.path.includes('?')
  // tslint:disable-next-line:no-object-mutation no-expression-statement
  options.path = `${options.path}${hasQuery ? '&' : '?'}access_token=${accessToken}`
}
