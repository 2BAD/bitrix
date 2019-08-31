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

## FAQ

> Is it finished?

Not yet. However, what's in the docs already works, and not yet covered Bitrix operations can be done with a provided low-level client methods.

> Does it handle authentication?

Not yet. You have to init client with already obtained by any legal means authentication token.

> Should I check payloads `error` properties for errors?

You shouldn't. Catch rejections instead, as the library will check it and reject if there are any errors in a payload.

> I need to call a Bitrix method which isn't supported yet

Use appropriate provided low-level client methods, like that:

```ts
bitrix.get('some.new.get.method' as any, { ID: 77 })
bitrix.list('some.new.list.method' as any, { select: ["TITLE"] })
```

> I need to call a specific set of commands. How to do that effectively?

Use low-level `batch` method. It will make minimum network requests and do all dirty work behind the curtains:

```ts
bitrix.batch({
  lead: { method: Method.GET_LEAD, params: { ID: 77 } },
  deals: { method: Method.LIST_DEALS }
})
```
