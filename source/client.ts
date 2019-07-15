// tslint:disable:object-literal-sort-keys

import got from 'got'
import { name, version } from '~/../package.json'

export const client = (restUri: string, token: string) => {
  const { get } = got.extend({
    baseUrl: restUri,
    headers: {
      'user-agent': `${name}/${version}`
    },
    json: true,
    hooks: {
      beforeRequest: [
        (options) => {
          const path = (options && options.path) ? options.path : ''
          // tslint:disable-next-line:no-object-mutation no-expression-statement
          options.path += (path.indexOf('?') === -1) ? `?access_token=${token}` : `&access_token=${token}`
        }
      ]
      // should be used with rate limiter to handle throttling cases
      // afterResponse: [
      //   (response) => {
      //     return response
      //   }
      // ]
    }
  })

  return {
    get: (resource: string, query: object) => get(resource, { query })
      .then((response) => response.body)
      .catch((message) => {
        // tslint:disable-next-line:no-throw
        throw Error(message)
      })
  }
}
