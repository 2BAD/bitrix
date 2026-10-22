# Services

```ts
const deal = await bitrix.deals.get(77)
console.log(deal.TITLE, deal.STAGE_ID) // Pump delivery C2:WON

const id = await bitrix.contacts.create({ NAME: 'Jane', PHONE: [{ VALUE: '+10000000000', VALUE_TYPE: 'WORK' }] })
await bitrix.contacts.update(id, { POST: 'CTO' })
await bitrix.contacts.delete(id)
```

Services resolve with the `result` of the Bitrix response: `get` with the entity, `create` with the new id, `update` and `delete` with `true`. Ids can be numbers or strings.

| Service                                                 | Methods                                                                                                                     |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `activities`, `companies`, `contacts`, `deals`, `leads` | `fields`, `get`, `list`, `paginate`, `changedSince`, `create`, `update`, `delete`, `createMany`, `updateMany`, `deleteMany` |
| `deals.productRows`, `leads.productRows`                | `get`, `set`                                                                                                                |
| `products`                                              | `fields`, `get`, `list`, `paginate`, `create`, `update`, `delete`                                                           |
| `statuses`                                              | `fields`, `get`, `list`, `create`, `update`, `delete`                                                                       |
| `users`                                                 | `fields`, `current`, `get`, `list`, `paginate`                                                                              |

Lists, `changedSince` and progress are in [Lists](lists.md), `createMany`, `updateMany` and `deleteMany` in [Batch and bulk writes](batch.md).

## Selected fields

Lists of CRM entities and products are typed by their `select`.

```ts
const deals = await bitrix.deals.list({ select: ['ID', 'TITLE'] })
deals[0]?.TITLE // string | null
deals[0]?.STAGE_ID // type error, not selected

const contacts = await bitrix.contacts.list({ select: ['*', 'UF_*', 'PHONE'] })
```

No select or `*` gives the standard fields. Bitrix leaves out user fields and multi fields like `PHONE` unless they are selected, so the types do too. `UF_*` adds user fields, see [Types](types.md) to type them.

## Sonet events

```ts
await bitrix.deals.create({ TITLE: 'Pump delivery' }, { REGISTER_SONET_EVENT: 'N' })
```

`create`, `update` and their bulk versions take the `params` of `crm.*.add` and `crm.*.update`.

## Product rows

```ts
const rows = await bitrix.deals.productRows.get(77)
await bitrix.deals.productRows.set(77, [{ PRODUCT_ID: 79595, PRICE: 1200, QUANTITY: 2 }])
```

`set` replaces every row of the deal or lead.

## Products

```ts
const product = await bitrix.products.get(79595)
const products = await bitrix.products.list({ filter: { iblockId: 23 }, select: ['name', 'xmlId'] })
const fields = await bitrix.products.fields(23)

const created = await bitrix.products.create({ iblockId: 23, name: 'Pump' })
await bitrix.products.update(created.id, { name: 'Pump 2' })
```

Products use `catalog.product.*`, which names fields in camelCase and needs an `iblockId` filter. The catalogs of a portal come from `catalog.catalog.list`. `id` and `iblockId` are always selected, `name` too when there is no select.

## Statuses

```ts
const sources = await bitrix.statuses.list({ filter: { ENTITY_ID: 'SOURCE' } })
await bitrix.statuses.delete(117, { forced: true })
```

`crm.status.list` returns every status at once, so there is no `paginate`.

## Users

```ts
const me = await bitrix.users.current()
const user = await bitrix.users.get(1)
const active = await bitrix.users.list({ filter: { ACTIVE: true } })
```

`get` throws a `BitrixError` with code `NOT_FOUND` for a missing user. `user.get` leaves out empty fields, so every field except `ID` is optional.
