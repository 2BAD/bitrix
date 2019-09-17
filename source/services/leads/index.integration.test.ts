/* tslint-env jest */
// tslint:disable: no-expression-statement object-literal-sort-keys

import Bitrix from './../../bitrix'

const WEBHOOK_URL = process.env.WEBHOOK_URL

// tslint:disable-next-line: no-if-statement
if (!WEBHOOK_URL) {
  // tslint:disable-next-line: no-throw
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
