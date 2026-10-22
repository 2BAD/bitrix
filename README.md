![@2bad/bitrix](https://user-images.githubusercontent.com/4460311/64487745-c4a1ea00-d246-11e9-9d6e-a0b0227c801c.png)

# Bitrix24 REST API client that doesn't suck

[![NPM version](https://img.shields.io/npm/v/@2bad/bitrix)](https://www.npmjs.com/package/@2bad/bitrix)
[![License](https://img.shields.io/npm/l/@2bad/bitrix)](https://www.npmjs.com/package/@2bad/bitrix)
[![Code coverage](https://img.shields.io/codecov/c/github/2BAD/bitrix)](https://codecov.io/gh/2BAD/bitrix)
[![GitHub Build Status](https://img.shields.io/github/actions/workflow/status/2BAD/bitrix/build.yml)](https://github.com/2BAD/bitrix/actions/workflows/build.yml)
[![Written in TypeScript](https://img.shields.io/github/languages/top/2BAD/bitrix)](https://github.com/2BAD/bitrix/search?l=typescript)

- Zero dependencies, runs anywhere `fetch` does: Node.js, Bun, Deno, Cloudflare Workers, browsers
- Typed params and results for every supported method, and a way to type your own
- Reads whole lists for you, 2500 rows per request
- Stays inside Bitrix rate limits and retries what can be retried
- Errors you can handle: `BitrixError` with the Bitrix code, HTTP status and method

### Install

```shell
pnpm add @2bad/bitrix
```

### Usage

```typescript
import { createClient } from '@2bad/bitrix'

const bitrix = createClient({ url: 'https://PORTAL_NAME.bitrix24.com/rest/1/WEBHOOK_TOKEN' })

const deal = await bitrix.deals.get(77)
console.log(deal.TITLE)

const won = await bitrix.deals.list({ filter: { STAGE_ID: 'WON' }, select: ['ID', 'TITLE', 'UF_*'] })
console.log(won.length)
```

### Authentication

There are two ways to authenticate:

1. **Inbound webhook.** Create one in the portal with the scopes you need and pass its URL. The token is part of the URL, nothing else is required:

   ```typescript
   const bitrix = createClient({ url: 'https://PORTAL_NAME.bitrix24.com/rest/1/WEBHOOK_TOKEN' })
   ```

2. **OAuth application.** Pass the REST endpoint and the access token. OAuth tokens expire after an hour, so give the client a function that returns the current token and a callback to refresh it. When Bitrix answers with `expired_token` the client calls `onAuthExpired` once, then repeats the request:

   ```typescript
   const bitrix = createClient({
     url: 'https://PORTAL_NAME.bitrix24.com/rest',
     auth: () => tokens.accessToken,
     onAuthExpired: async () => {
       tokens = await refreshTokens(tokens.refreshToken)
     }
   })
   ```

   Getting and refreshing tokens is up to you, see the [Bitrix OAuth docs](https://apidocs.bitrix24.com/api-reference/oauth/index.html).

### Services

Every service returns the `result` of the Bitrix response, so `deals.get` resolves with a deal and `deals.create` resolves with the new id. Ids can be passed as numbers or strings.

| Service                                                          | Methods                                                                                                                         |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `activities`, `companies`, `contacts`, `deals`, `leads`          | `fields`, `get`, `list`, `paginate`, `changedSince`, `create`, `update`, `delete`, `createMany`, `updateMany`, `deleteMany` |
| `deals.productRows`, `leads.productRows`                         | `get`, `set`                                                                                                                    |
| `products` (`catalog.product.*`, the filter needs an `iblockId`) | `fields`, `get`, `list`, `paginate`, `create`, `update`, `delete`                                                               |
| `statuses`                                                       | `fields`, `get`, `list`, `create`, `update`, `delete`                                                                           |
| `users`                                                          | `fields`, `current`, `get`, `list`, `paginate`                                                                                  |

```typescript
const id = await bitrix.contacts.create({ NAME: 'Jane', PHONE: [{ VALUE: '+10000000000', VALUE_TYPE: 'WORK' }] })
await bitrix.contacts.update(id, { POST: 'CTO' })

const rows = await bitrix.deals.productRows.get(77)

const products = await bitrix.products.list({ filter: { iblockId: 23 }, select: ['id', 'name', 'xmlId'] })
```

#### Selected fields

Service lists are typed by their `select`. Named fields give rows with just those fields, `*` or no select give the standard fields, and `UF_*` adds user fields. Bitrix leaves out user fields and multi fields like `PHONE` unless they are selected, so the types do too:

```typescript
const deals = await bitrix.deals.list({ select: ['ID', 'TITLE'] })
deals[0]?.TITLE // string | null
deals[0]?.STAGE_ID // type error, not selected
```

#### Bulk writes

`createMany`, `updateMany` and `deleteMany` send the writes through `batch`, 50 per request. They resolve with a result and an error per item, in the order of the input, and do not reject when some items fail:

```typescript
const { results, errors } = await bitrix.leads.createMany(rows.map((row) => ({ TITLE: row.title, NAME: row.name })))
errors.forEach((error, index) => error && console.error(rows[index], error.description))

await bitrix.deals.updateMany([{ id: 77, fields: { STAGE_ID: 'WON' } }])
await bitrix.deals.deleteMany([78, 79])
```

#### Changes since a point in time

`changedSince` reads the entities created or changed at or after a date, oldest change first. It pages by modification time and id, so it does not skip rows that share the same time. Store the modification time of the last row you processed and pass it on the next run:

```typescript
for await (const deal of bitrix.deals.changedSince(lastSync, { select: ['ID', 'TITLE', 'DATE_MODIFY'] })) {
  await save(deal)
  lastSync = deal.DATE_MODIFY
}
```

A row that changes again during the read is returned again with its new values. Activities use `LAST_UPDATED`, the other entities `DATE_MODIFY`.

### Generic methods

The services cover the common entities. Everything else goes through four generic methods that work with any REST method.

#### `call`

Calls a single method and resolves with its `result`. Pass `{ raw: true }` to get the whole response with `time`, `total` and `next`:

```typescript
const deal = await bitrix.call('crm.deal.get', { id: 77 })
const { result, total, time } = await bitrix.call('crm.deal.list', { select: ['ID'] }, { raw: true })
```

#### `list` and `paginate`

`list` reads every page of a list method into an array. `paginate` does the same as an async iterator, so you can process rows as they come and stop early without fetching the rest:

```typescript
const deals = await bitrix.list('crm.deal.list', { filter: { CLOSED: 'N' } })

for await (const activity of bitrix.paginate('crm.activity.list', { filter: { COMPLETED: 'N' } })) {
  if (shouldStop(activity)) break
}
```

By default both walk the list by ascending id (`filter: { '>ID': last }` with `start: -1`), the approach Bitrix recommends for large data sets. It skips the row count, does not slow down with depth and does not skip or repeat rows when records change during the read. Each request is a `batch` of chained pages. Batches start with one page and double up to 50 pages, so a loop that stops early costs few requests and a long read gets up to 2500 rows per request.

The id mode always orders by id. For a custom order use `{ mode: 'offset' }`, which pages with `start` and batches pages the same way:

```typescript
const latest = await bitrix.list('crm.deal.list', { order: { DATE_CREATE: 'DESC' } }, { mode: 'offset' })
```

`{ mode: 'modified', since }` reads rows changed at or after `since` by `DATE_MODIFY`, which is what `changedSince` uses. Set `modifiedField` for methods that name it differently.

Catalog style methods name their id `id` and wrap rows in an object like `{ products: [...] }`. The rows are found automatically, the id field is set with `idField`:

```typescript
bitrix.paginate('catalog.product.list', { filter: { iblockId: 23 }, select: ['id', 'iblockId'] }, { idField: 'id' })
```

#### `batch`

Runs any number of commands, 50 per request. Keyed commands give keyed results, arrays give arrays. A failed command does not reject the call, its error is in `errors` under the same key:

```typescript
const { results, errors } = await bitrix.batch({
  deal: { method: 'crm.deal.get', params: { id: 77 } },
  lead: { method: 'crm.lead.get', params: { id: 78 } }
})

if (errors.lead) console.error(errors.lead.description)
console.log(results.deal?.TITLE)
```

Pass `{ halt: true }` to stop at the first failed command.

### Typing other methods

Methods the client knows about are typed: their params are checked and their results are inferred. Any other method still works, with loose params and an `unknown` result. To type it, add it to the `Methods` interface:

```typescript
declare module '@2bad/bitrix' {
  interface Methods {
    'tasks.task.get': { params: { taskId: number; select?: string[] }; result: { task: Task } }
  }
}

const { task } = await bitrix.call('tasks.task.get', { taskId: 1 })
```

User fields (`UF_*`) are part of every CRM entity type as `unknown`, so read them with a type check or a cast.

### Errors

Every failure rejects with a `BitrixError`:

```typescript
import { BitrixError } from '@2bad/bitrix'

try {
  await bitrix.deals.get(1)
} catch (error) {
  if (error instanceof BitrixError) {
    console.error(error.code, error.description, error.status, error.method)
  }
}
```

`code` is the Bitrix error code like `ACCESS_DENIED` or `ERROR_METHOD_NOT_FOUND`. Bitrix sends some errors without a code, then `code` is `HTTP_<status>` and `description` holds the message. Errors of `batch` commands also have `command` set to the key of the command.

### Rate limits and retries

Bitrix allows a burst of 50 requests and then 2 requests per second. The client queues requests to stay inside that limit and adjusts to it when Bitrix still answers with `QUERY_LIMIT_EXCEEDED`. Enterprise plans allow more, so the limits are configurable.

Server errors, network errors, `QUERY_LIMIT_EXCEEDED` and `OPERATION_TIME_LIMIT` are retried with exponential backoff. For `OPERATION_TIME_LIMIT` the client waits until the method limit resets, using `operating_reset_at` from earlier responses. This also applies to single commands of a `batch`: the ones that hit the limit are sent again in a new batch, except commands that reference other results with `$result`, since those references only work inside the original batch. When a chained page of `paginate` hits the limit, the read continues from the last page it got.

```typescript
const bitrix = createClient({
  url,
  limiter: { burst: 250, refillPerSecond: 5 },
  retry: { retries: 5, delay: 500 }
})
```

Retries of server and network errors can repeat a write that Bitrix already applied before the error, for example create a deal twice. Rate limit errors are safe to retry, Bitrix rejects those requests before running them. Set `retry: { retries: 0 }` on a client used for writes that must not repeat.

`call`, `list`, `paginate` and `batch` accept a `signal` in their options to cancel a call, and `createClient` accepts one to cancel everything.

### Logging and metrics

`onRequest` runs before every HTTP request and `onResponse` after it, retries included. The events carry the method, its params (without the auth token), the attempt number, the duration and Bitrix timing info, so they fit structured logs and metrics:

```typescript
const bitrix = createClient({
  url,
  onResponse: ({ method, attempt, duration, time, error }) =>
    console.log(JSON.stringify({ method, attempt, duration, operating: time?.operating, error: error && String(error) }))
})
```

A hook that throws fails the call, so keep them simple.

### Custom fetch

Pass your own `fetch` to add a proxy, custom TLS settings or logging:

```typescript
import { Agent, fetch } from 'undici'

const dispatcher = new Agent({ connect: { rejectUnauthorized: false } })
const bitrix = createClient({ url, fetch: (input, init) => fetch(input, { ...init, dispatcher }) })
```

### Migrating from 2.x

- `Bitrix(url, token, gotOptions)` is now `createClient({ url, auth, fetch })`. The default export is gone.
- Methods resolve with the `result` instead of the whole payload: `const { result } = await bitrix.deals.get('77')` becomes `const deal = await bitrix.deals.get(77)`. Use `call(method, params, { raw: true })` for the whole response.
- The `Method` constants are gone, use method names: `Method.CRM_DEAL_GET` becomes `'crm.deal.get'`.
- `list` returns an array of rows instead of a list payload. It now walks by id and rejects an `order` by another field; pass `{ mode: 'offset' }` to keep a custom order.
- `batch` resolves with `{ results, errors }` and no longer rejects when a command fails.
- `users.get()` without an id is now `users.list()`, and `users.get(id)` resolves with a single user.
- `statuses.delete(id, { FORCED: 'Y' })` is now `statuses.delete(id, { forced: true })`.
- Errors are `BitrixError` instances instead of plain `Error`s.
- New services: `activities`, `products`, `deals.productRows` and `leads.productRows`, plus `delete` for all CRM entities.
- The `Currency` type is removed.

### Development

- `pnpm test` runs all tests
- `pnpm test:unit` runs unit and type tests with coverage
- `pnpm test:integration` runs integration tests against a live portal, set `WEBHOOK_URL` first. They only read data
- `pnpm check` lints, checks formatting and types
- `pnpm fix` applies lint and format fixes
- `pnpm build` builds the library
