// tslint:disable:object-literal-sort-keys

import got from 'got'
import { name, version } from '../../../package.json'
import makeBatch from './methods/batch'
import makeGet from './methods/get'
import makeGetList from './methods/getList'
import makeList from './methods/list'

export default (restUri: string, token: string) => {
  const instance = got.extend({
    baseUrl: restUri,
    headers: {
      'user-agent': `${name}/${version}`
    },
    json: true,
    query: {
      access_token: token
    },
    hooks: {
      // should be used with rate limiter to handle throttling cases
      // afterResponse: [
      //   (response) => {
      //     return response
      //   }
      // ]
    }
  })

  const get = makeGet(instance)
  const getList = makeGetList(instance)
  const batch = makeBatch(instance)
  const list = makeList({ getList, batch })

  return {
    get,
    getList,
    batch,
    list
  }
}
