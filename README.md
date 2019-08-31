# @2bad/bitrix

> Bitrix24 REST API client that doesn't suck

**Features:**

* No bullshit
* Expressive API
* Strongly typed with TypeScript
* Typed requests results
* Promise-based

## Testing examples

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

Not yet. What's in the docs already works, and not covered Bitrix operations can be done with a provided low-level client methods.

> Does it handle authentication?

Not yet. You have to init client with already obtained by any legal means authentication token.

> Should I check payloads `error` properties for errors?

You shouldn't. Catch rejections instead, as the library will reject if there are any errors in a payload.

> I need to call a Bitrix method which isn't supported yet

Use appropriate low-level client methods, like so:

```ts
bitrix.get<SomeNewMethodType>('some.new.get.method' as any, { ID: 77 })
bitrix.list<SomeNewMethodType>('some.new.list.method' as any, { select: ["TITLE"] })
```

> I need to call a specific set of commands. How to do that effectively?

Use `batch` method. It will handle all routine:

```ts
bitrix.batch<{
  lead: Lead,
  deals: Deal[]
}>({
  lead: { method: Method.GET_LEAD, params: { ID: 77 } },
  deals: { method: Method.LIST_DEALS }
})
```

## Development

* `npm test` — run all tests
* `npm run test:unit` — run unit tests
* `npm run test:integration` — run integration tests
* `npm run test:watch` — watch for changes and run all tests
* `npm run test:unit:watch` — watch for changes and run unit tests
* `npm run test:integration:watch` — watch for changes and run integration tests
* `npm run build` — build library for the release
