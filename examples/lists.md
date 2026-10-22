# Lists

```ts
const deals = await bitrix.deals.list({ filter: { CLOSED: 'N' }, select: ['ID', 'TITLE'] })

for await (const activity of bitrix.activities.paginate({ filter: { COMPLETED: 'N' } })) {
  if (shouldStop(activity)) break
}
```

`list` reads every page into an array. `paginate` does the same as an async iterator, so rows are processed as they come and breaking out stops the reads. Both exist on the services and as generic methods for any list method:

```ts
const quotes = await bitrix.list('crm.quote.list', { filter: { CLOSED: 'N' } })
```

## Options

```ts
const rows = await bitrix.list('crm.deal.list', params, {
  // optional, values are the defaults
  mode: 'cursor', // or 'offset', 'modified'
  idField: 'ID', // 'id' for catalog style methods

  // optional, off by default
  signal, // aborts the read
  onProgress: ({ read, total }) => {} // after every page
})
```

## Modes

`cursor` walks the list by ascending id with `filter: { '>ID': last }` and `start: -1`, the way Bitrix recommends for large lists. It skips the row count, does not slow down with depth and does not skip or repeat rows when records change during the read. It orders by id and rejects any other `order`.

`offset` pages with `start` and keeps any `order`:

```ts
const latest = await bitrix.deals.list({ order: { DATE_CREATE: 'DESC' } }, { mode: 'offset' })
```

`modified` reads rows changed at or after `since`, see below.

After the first page, `cursor` and `offset` send pages in `batch` requests. Batches start with one page and double up to 50 pages, so an early `break` costs few requests and a long read gets up to 2500 rows per request.

Catalog style methods wrap rows in an object like `{ products: [...] }`. The rows are found automatically, the id field is set with `idField`.

## Changes since a point in time

```ts
let lastSync = await loadCheckpoint()

for await (const deal of bitrix.deals.changedSince(lastSync, { select: ['ID', 'TITLE', 'DATE_MODIFY'] })) {
  await save(deal)
  lastSync = deal.DATE_MODIFY
}
```

`changedSince` reads the entities created or changed at or after a `Date` or ISO string, oldest change first. It pages by modification time and id, so rows sharing the same time are not skipped. A row that changes again during the read is returned again with its new values. Activities use `LAST_UPDATED`, the other entities `DATE_MODIFY`.

For other methods use the mode directly:

```ts
bitrix.paginate('crm.quote.list', {}, { mode: 'modified', since: lastSync })
```

Set `modifiedField` for methods that name the field differently than `DATE_MODIFY`.

## Progress

```ts
const activities = await bitrix.activities.list(
  { filter: { COMPLETED: 'N' } },
  { onProgress: ({ read, total }) => console.log(`${read} of ${total ?? '?'}`) }
)
```

`onProgress` is called after every page with the rows read so far and the total when Bitrix reports one. `cursor` and `modified` skip the row count to stay fast, so with `onProgress` set their first request counts the rows instead: one slower request, several seconds on 370 thousand activities. The total is the count at the start, rows created or changed during the read can make `read` end above it.
