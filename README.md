# @2bad/bitrix

> Bitrix24 REST API client that doesn't suck

Some testing examples:

```ts
import Bitrix from './bitrix'
import { Method } from './bitrix/types'

const BITRIX_ADDRESS = 'https://DOMAIN.bitrix24.ru'
const AUTH_TOKEN = 'AUTH_TOKEN'

const bitrix = Bitrix(`${BITRIX_ADDRESS}/rest`, AUTH_TOKEN)

// ----------------------
// Common methods
// ----------------------

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
bitrix.getList(Method.LIST_DEALS, {})
  .then(console.log)
  .catch(console.error)

// ----------------------
// API
// ----------------------

// Get deal
bitrix.deals.get({ ID: 25 })
  .then(console.log)
  .catch(console.error)

// Get all deals
bitrix.deals.list({ select: ["*", "UF_*"] })
  .then(console.log)
  .catch(console.error)
```
