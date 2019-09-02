// tslint:disable:object-literal-sort-keys

import got from 'got'
import addAccessToken from './hooks/addAccessToken'
import Batch from './methods/batch'
import Get from './methods/get'
import GetList from './methods/getList'
import List from './methods/list'

export default (restUri: string, accessToken: string) => {
  const instance = got.extend({
    baseUrl: restUri,
    headers: {
      'user-agent': `@2bad/bitrix`
    },
    json: true,
    hooks: {
      beforeRequest: [
        addAccessToken(accessToken)
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
