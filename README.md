# @2bad/bitrix

[![NPM version](https://img.shields.io/npm/v/@2bad/bitrix)](https://www.npmjs.com/package/@2bad/bitrix)
[![License](https://img.shields.io/npm/l/@2bad/bitrix)](https://www.npmjs.com/package/@2bad/bitrix)
[![Code coverage](https://img.shields.io/codecov/c/github/2BAD/bitrix)](https://codecov.io/gh/2BAD/bitrix)
[![GitHub Build Status](https://img.shields.io/github/actions/workflow/status/2BAD/bitrix/build.yml)](https://github.com/2BAD/bitrix/actions/workflows/build.yml)

Bitrix24 REST API client for TypeScript with zero runtime dependencies.

## Why

Bitrix24 ships half-finished APIs to production and leaves you to find out how they actually work. Every module has its own field names, error formats and paging rules. The documentation is incomplete, out of date or wrong, a good part of the behavior isn't documented at all, and support won't help you. Every integration turns into reverse engineering, fixing one broken assumption at a time.

We did that work so you don't have to. This client takes whatever Bitrix throws at it and gives you something you can actually build on.

## What you get

- No bullshit
- Expressive API
- Strongly typed, including the custom fields of your portal
- Handles batching, rate limits and retries for you
- Zero dependencies, runs anywhere `fetch` does

## Install

```sh
npm install @2bad/bitrix
```

ESM only. The `bitrix-types` command needs Node.js 26 or later.

## Quick start

```ts
import { createClient } from '@2bad/bitrix'

const bitrix = createClient({ url: 'https://portal.bitrix24.com/rest/1/WEBHOOK_TOKEN' })

const deal = await bitrix.deals.get(77)
console.log(deal.TITLE, deal.STAGE_ID) // Pump delivery C2:WON

const open = await bitrix.deals.list({ filter: { CLOSED: 'N' }, select: ['ID', 'TITLE'] })
```

## Examples

- [Connecting](examples/connecting.md): webhooks, OAuth, rate limits, logging and custom `fetch`
- [Services](examples/services.md): deals, leads, contacts, companies, activities, smart processes, linked contacts, products, statuses, currencies and users
- [Lists](examples/lists.md): pagination modes, changes since the last sync and progress
- [Batch and bulk writes](examples/batch.md): many commands per request, `createMany`, `updateMany`, `deleteMany`
- [Types](examples/types.md): user field types from your portal and typing other methods
- [Errors](examples/errors.md): `BitrixError`, retries and cancellation
- [Migrating from 2.x](examples/migrating.md)

## API

```ts
function createClient(options: ClientOptions): Client

type Client = {
  call(method, params?, options?: { raw?; signal? }): Promise<Result> // the whole response with { raw: true }
  list(method, params?, options?: PaginateOptions): Promise<Row[]>
  paginate(method, params?, options?: PaginateOptions): AsyncGenerator<Row>
  batch(commands, options?: { halt?; signal? }): Promise<{ results; errors }>

  activities: CrmService<Activity>
  companies: CrmService<Company> & { contacts: Links }
  contacts: CrmService<Contact> & { companies: Links }
  currencies: CurrenciesService
  deals: CrmService<Deal> & { productRows: ProductRows; contacts: Links }
  items(entityTypeId): ItemsService // smart processes and other crm.item.* types
  leads: CrmService<Lead> & { productRows: ProductRows; contacts: Links }
  products: ProductsService
  statuses: StatusesService
  users: UsersService
}

type CrmService<Entity> = {
  fields(): Promise<Fields>
  get(id): Promise<Entity>
  list(params?, options?: PaginateOptions): Promise<Entity[]> // rows typed by params.select
  paginate(params?, options?: PaginateOptions): AsyncGenerator<Entity>
  changedSince(since: Date | string, params?, options?): AsyncGenerator<Entity> // oldest change first
  create(fields, params?): Promise<number>
  update(id, fields, params?): Promise<boolean>
  delete(id): Promise<boolean>
  createMany(items, params?): Promise<BulkResult<number>>
  updateMany(items: { id; fields }[], params?): Promise<BulkResult<boolean>>
  deleteMany(ids): Promise<BulkResult<boolean>>
}

type ProductRows = { get(id): Promise<ProductRow[]>; set(id, rows): Promise<boolean> }
type Links = { get(id); set(id, links); add(id, link); delete(id, linkedId); clear(id) }
type ItemsService = { fields(); get(id); list(params?); paginate(params?); changedSince(since, params?); create(fields); update(id, fields); delete(id) }
type ProductsService = { fields(iblockId); get(id); list(params); paginate(params); create(fields); update(id, fields); delete(id) }
type StatusesService = { fields(); get(id); list(params?); create(fields); update(id, fields); delete(id, { forced? }) }
type CurrenciesService = { fields(); get(code); list(params?); create(fields); update(code, fields); delete(code); base(); setBase(code) }
type UsersService = { fields(); current(); get(id); list(params?); paginate(params?) }

type PaginateOptions = {
  mode?: 'cursor' | 'offset' | 'modified' // cursor by default, modified needs since
  since?: Date | string
  modifiedField?: string // DATE_MODIFY by default
  idField?: string // ID by default
  signal?: AbortSignal
  onProgress?: (progress: { read: number; total?: number }) => void
}

type BulkResult<R> = { results: (R | undefined)[]; errors: (BitrixError | undefined)[] } // in input order
```

```sh
bitrix-types [--url <rest url>] [--out <file>] [--entities deal,lead,contact,company]
```

Every error is a `BitrixError` with `code`, `description`, `method` and `status`.

## License

MIT
