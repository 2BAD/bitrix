# Migrating from 2.x

## Creating the client

```ts
// 2.x
import Bitrix from '@2bad/bitrix'
const bitrix = Bitrix('https://portal.bitrix24.com/rest', 'ACCESS_TOKEN', gotOptions)
```

```ts
// 3.x
import { createClient } from '@2bad/bitrix'
const bitrix = createClient({ url: 'https://portal.bitrix24.com/rest', auth: 'ACCESS_TOKEN' })
```

The default export is gone. `got` options are replaced by `fetch`, see [Connecting](connecting.md#custom-fetch).

## Results

```ts
// 2.x
const { result } = await bitrix.deals.get('77')

// 3.x
const deal = await bitrix.deals.get(77)
```

Methods resolve with the `result` instead of the whole payload. `call(method, params, { raw: true })` gives the whole response with `time`, `total` and `next`.

## Changes

| 2.x                                    | 3.x                                                   |
| -------------------------------------- | ----------------------------------------------------- |
| `Method.CRM_DEAL_GET`                  | `'crm.deal.get'`                                      |
| `list()` resolves with a list payload  | resolves with an array of rows                        |
| `list()` keeps any `order`             | orders by id, pass `{ mode: 'offset' }` for any order |
| `batch()` rejects when a command fails | resolves with `{ results, errors }`                   |
| `users.get()` without an id            | `users.list()`                                        |
| `users.get(id)` resolves with an array | resolves with a single user                           |
| `statuses.delete(id, { FORCED: 'Y' })` | `statuses.delete(id, { forced: true })`               |
| plain `Error`                          | `BitrixError`, see [Errors](errors.md)                |
| `UF_*` fields typed as `string`        | `unknown`, or generated types, see [Types](types.md)  |

New in 3.x: `activities`, `currencies`, `items`, `products`, product rows and linked contacts services, `delete`, `changedSince` and bulk writes for CRM entities, `paginate`, `onProgress`, request hooks and the `bitrix-types` command.
