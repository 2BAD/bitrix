// tslint:disable:object-literal-sort-keys

import got from 'got'
import { name, version } from '../../../package.json'
import Batch from './methods/batch'
import Get from './methods/get'
import GetList from './methods/getList'
import List from './methods/list'

/**
 * Got can't merge `query` option with other queries if they are string. But that hook can.
 */
const addAccessTokenHook = (token: string) => (options: got.GotJSONOptions) => {
  // tslint:disable-next-line: no-if-statement
  if (!options.path) return

  const hasQuery = options.path.includes('?')
  // tslint:disable-next-line:no-object-mutation no-expression-statement
  options.path = `${options.path}${hasQuery ? '&' : '?'}access_token=${token}`
}

export default (restUri: string, token: string) => {
  const instance = got.extend({
    baseUrl: restUri,
    headers: {
      'user-agent': `${name}/${version}`
    },
    json: true,
    hooks: {
      beforeRequest: [
        addAccessTokenHook(token)
      ]
      // should be used with rate limiter to handle throttling cases
      // afterResponse: [
      //   (response) => {
      //     return response
      //   }
      // ]
    }
  })

  const get = Get(instance)
  const getList = GetList(instance)
  const batch = Batch(instance)
  const list = List({ getList, batch })

  return {
    get,
    getList,
    batch,
    list
  }
}
