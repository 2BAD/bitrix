import { describe, expect, it } from 'vitest'
import Bitrix from './../../bitrix.js'

const WEBHOOK_URL = process.env['WEBHOOK_URL']

if (!WEBHOOK_URL) {
  throw Error('Integration tests require environmental variable `WEBHOOK_URL` to be set')
}

const { deals } = Bitrix(WEBHOOK_URL)

describe('Deals', () => {
  describe('fields', () => {
    it('should get all fields', async () => {
      const { result } = await deals.fields()
      expect(result).toMatchSnapshot()
    })
  })
})
