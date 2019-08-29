# @2bad/iris.crm.bitrix

Bitrix24 REST API client

Some testing examples:

```ts
import prepareBitrix from './bitrix'
import { Method } from './bitrix/types'

const BITRIX_ADDRESS = 'https://DOMAIN.bitrix24.ru'
const AUTH_TOKEN = 'AUTH_TOKEN'

const bitrix = prepareBitrix(`${BITRIX_ADDRESS}/rest`, AUTH_TOKE)

bitrix.batch({
  one: {
    method: Method.GET_DEAL,
    params: { ID: 99999999999999999 } // will give one error in batch
  },
  two: {
    method: Method.GET_DEAL,
    params: { ID: 3357 }
  }
})
  .then(console.log)
  .catch(console.error)

bitrix.get(Method.GET_DEAL, { query: { ID: 3357 } })
  .then(console.log)
  .catch(console.error)

// Error example
bitrix.get(Method.GET_DEAL, { query: { ID: 9999999999999 } })
  .then(console.log)
  .catch(console.error)

// Get first 50
bitrix.get(Method.LIST_DEALS, {})
  .then(console.log)
  .catch(console.error)

// Get all
bitrix.deals.list()
  .then(console.log)
  .catch(console.error)
```
