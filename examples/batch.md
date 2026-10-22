# Batch and bulk writes

## Batch

```ts
const { results, errors } = await bitrix.batch({
  deal: { method: 'crm.deal.get', params: { id: 77 } },
  lead: { method: 'crm.lead.get', params: { id: 78 } }
})

if (errors.lead) console.error(errors.lead.description) // Not found
console.log(results.deal?.TITLE) // Pump delivery
```

Runs any number of commands, 50 per request. Keyed commands give keyed results, arrays give arrays. A failed command does not reject the call, its `BitrixError` is in `errors` under the same key with `command` set. Results and errors are typed per command.

```ts
const { results } = await bitrix.batch(ids.map((id) => ({ method: 'crm.deal.get', params: { id } })))
```

## Options

```ts
await bitrix.batch(commands, {
  // optional, off by default
  halt: true, // stop at the first failed command
  signal // aborts the batch
})
```

## References between commands

```ts
const { results } = await bitrix.batch({
  deal: { method: 'crm.deal.get', params: { id: 77 } },
  company: { method: 'crm.company.get', params: { id: '$result[deal][COMPANY_ID]' } }
})
```

`$result` references only work between commands of the same request, keep related commands within 50 of each other.

## Bulk writes

```ts
const { results, errors } = await bitrix.leads.createMany(rows.map((row) => ({ TITLE: row.title, NAME: row.name })))
errors.forEach((error, index) => error && console.error(rows[index], error.description))

await bitrix.deals.updateMany([{ id: 77, fields: { STAGE_ID: 'WON' } }])
await bitrix.deals.deleteMany([78, 79])
```

`createMany`, `updateMany` and `deleteMany` send the writes through `batch`, 50 per request. They resolve with a result and an error per item in the order of the input and do not reject when some items fail. `createMany` results are the new ids.

## Retries

Commands that fail with `OPERATION_TIME_LIMIT` are sent again in a new batch once the method limit resets, unless they contain a `$result` reference. With `halt`, the commands skipped after the failed one are sent again too. Other failed commands are not retried.

A request that fails with a server or network error is retried as a whole, which can repeat writes Bitrix already applied, see [Errors](errors.md#retries).
