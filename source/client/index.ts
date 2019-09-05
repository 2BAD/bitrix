// tslint:disable:object-literal-sort-keys

import got from 'got'
import Queue from 'p-queue'
import addAccessToken from './hooks/addAccessToken'
import Batch from './methods/batch'
import Call from './methods/call'
import List from './methods/list'

const BITRIX_API_RATE_LIMIT = 2
const BITRIX_API_RATE_INTERVAL = 1000 // 1 second

export default (restUri: string, accessToken: string) => {
  const client = got.extend({
    baseUrl: restUri,
    headers: {
      'user-agent': `@2bad/bitrix`
    },
    json: true,
    hooks: {
      beforeRequest: [
        addAccessToken(accessToken)
      ]
    }
  })

  const queue = new Queue({
    intervalCap: BITRIX_API_RATE_LIMIT,
    interval: BITRIX_API_RATE_INTERVAL
  })

  const call = Call({ client, queue })
  const batch = Batch({ client, queue })
  const list = List({ call, batch })

  return {
    call,
    batch,
    list
  }
}
