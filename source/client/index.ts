// tslint:disable:object-literal-sort-keys

import got from 'got'
import addAccessToken from './hooks/addAccessToken'
import Batch from './methods/batch'
import Call from './methods/call'
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

  const call = Call(instance)
  const batch = Batch(instance)
  const list = List({ call, batch })

  return {
    call,
    batch,
    list
  }
}
