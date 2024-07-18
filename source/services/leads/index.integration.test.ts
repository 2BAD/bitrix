import { describe, expect, it } from 'vitest'
import Bitrix from './../../bitrix.js'

const WEBHOOK_URL = process.env['WEBHOOK_URL']

if (!WEBHOOK_URL) {
  throw Error('Integration tests require environmental variable `WEBHOOK_URL` to be set')
}

const { leads } = Bitrix(WEBHOOK_URL)

describe('Leads', () => {
  describe('fields', () => {
    it('should get all fields', async () => {
      const { result } = await leads.fields()
      expect(result).toMatchSnapshot()
    })
  })
})
