import got from 'got'
import flat from 'lodash/flattenDepth'
import { name, version } from './../../package.json'

const MAX_ENTRIES_PER_PAGE = 50
const MAX_PAGES_PER_BATCH = 50
const MAX_ENTRIES_PER_BATCH = MAX_ENTRIES_PER_PAGE * MAX_PAGES_PER_BATCH

class Bitrix {
  constructor (restUri, token) {
    this.client = got.extend({
      baseUrl: restUri,
      json: true,
      headers: {
        'user-agent': `${name}/${version}`
      },
      hooks: {
        beforeRequest: [
          options => {
            options.path += (options.path.indexOf('?') === -1) ? `?access_token=${token}` : `&access_token=${token}`
          }
        ]
      }
    })
  }

  async getData (resource, query) {
    return this.client.get(resource, { query }).then(response => response.body)
  }

  async getTotal (resource) {
    return this.getData(resource).then(data => data.total)
  }

  async getDataByPage (resource, total) {
    let query = {}
    const requests = []

    // generate array of requests
    for (let i = 0; i <= total; i += MAX_ENTRIES_PER_PAGE) {
      query = { start: i }
      requests.push(this.getData(resource, query).then(data => data.result))
    }

    // wait for all requests to finish and return flatten to single level array data array
    return Promise.all(requests).then(data => flat(data, 1))
  }

  async getDataByBatch (resource, total) {
    const requests = []

    // generate a batch request for each 2500 entries
    for (let processed = 0; processed <= total; processed += MAX_ENTRIES_PER_BATCH) {
      let remaining = total - processed
      let pages = remaining > MAX_ENTRIES_PER_BATCH ? MAX_PAGES_PER_BATCH : Math.ceil(remaining / MAX_ENTRIES_PER_PAGE)

      let query = {}
      // generate query parameters object for each request
      for (let i = 0; i < pages; i++) {
        query[`cmd[${i}]`] = `${resource}?start=${processed + i * MAX_ENTRIES_PER_PAGE}`
      }

      requests.push(this.getData('batch', query).then(data => data.result.result))
    }

    // wait for all requests to finish and return flatten to single level data array
    return Promise.all(requests).then(data => flat(data, 2))
  }

  async fetch (resource) {
    const total = await this.getTotal(resource)

    return (total <= MAX_ENTRIES_PER_PAGE) ? this.getDataByPage(resource, total) : this.getDataByBatch(resource, total)
  }
}

export default Bitrix
