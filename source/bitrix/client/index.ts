// tslint:disable:object-literal-sort-keys

import got from 'got'
import { name, version } from '../../../package.json'
import Batch from './methods/batch'
import Get from './methods/get'
import GetList from './methods/getList'
import List from './methods/list'

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
