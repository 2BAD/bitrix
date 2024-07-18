import { describe, expect, it } from 'vitest'
import Bitrix from './../../bitrix'

const WEBHOOK_URL = process.env['WEBHOOK_URL']

if (!WEBHOOK_URL) {
  throw Error('Integration tests require environmental variable `WEBHOOK_URL` to be set')
}

const { users } = Bitrix(WEBHOOK_URL)

describe('Users', () => {
  describe('fields', () => {
    it('should get all fields', async () => {
      const { result } = await users.fields()
      expect(result).toMatchSnapshot()
    })
  })

  describe('get', () => {
    it('should get all users', async () => {
      const { result } = await users.get()
      expect(result).toMatchSnapshot()
    })
    it('should get entry with ID = 1', async () => {
      const { result } = await users.get('1')
      expect(result).toMatchSnapshot()
    })
    it('should return an error in case non existent ID is requested', async () => {
      const { result } = await users.get('1001')
      expect(result).toEqual([])
    })
  })
})
