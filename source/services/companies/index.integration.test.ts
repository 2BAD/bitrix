import { describe, expect, it } from 'vitest'
import Bitrix from './../../bitrix'

const WEBHOOK_URL = process.env['WEBHOOK_URL']

if (!WEBHOOK_URL) {
  throw Error('Integration tests require environmental variable `WEBHOOK_URL` to be set')
}

const { companies } = Bitrix(WEBHOOK_URL)

describe('Companies', () => {
  describe('fields', () => {
    it('should get all fields', async () => {
      const { result } = await companies.fields()
      expect(result).toMatchSnapshot()
    })
  })
})
