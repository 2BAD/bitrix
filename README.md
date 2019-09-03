# Bitrix24 REST API client that doesn't suck

<p>
  <a href='https://www.npmjs.com/package/@2bad/bitrix'>
    <img src='https://img.shields.io/npm/v/@2bad/bitrix.svg' alt='NPM version' />
  </a>
  <a href='https://www.npmjs.com/package/@2bad/bitrix'>
    <img src='https://img.shields.io/npm/l/@2bad/bitrix.svg' alt='License' />
  </a>
  <a href='https://codecov.io/gh/2BAD/bitrix'>
    <img src='https://img.shields.io/codecov/c/github/2BAD/bitrix.svg' alt='Code coverage' />
  </a>
  <a href='https://circleci.com/gh/2BAD/bitrix'>
    <img src='https://img.shields.io/circleci/build/gh/2BAD/bitrix/master.svg?label=circle' alt='CircleCI Build Status' />
  </a>
  <a href='https://david-dm.org/2BAD/bitrix'>
    <img src='https://img.shields.io/david/2BAD/bitrix.svg' alt='Dependency Status' />
  </a>
  <a href='https://github.com/2BAD/bitrix/search?l=typescript'>
    <img src='https://img.shields.io/github/languages/top/2BAD/bitrix.svg' alt='Written in TypeScript' />
  </a>
</p>

* 🔥 No bullshit
* ✨ Expressive API
* 💪 Strongly typed methods and requests results with TypeScript
* 🚀 Handles records batching for you
* ❤️ Promise-based

![@2bad/bitrix usage example](https://user-images.githubusercontent.com/4460311/64130824-7798c080-cdcd-11e9-99f0-7ded87541a85.png)

## Install

```shell
npm install @2bad/bitrix
```

## Usage

Init client with Bitrix API endpoint and access token and use the client to ease your Bitrix pain:

```ts
import Bitrix from '@2bad/bitrix'

const bitrix = Bitrix('https://PORTAL_NAME.bitrix24.ru/rest', 'ACCESS_TOKEN')

// Get deal
bitrix.deals.get('77')
  .then(({ result }) => {
    // Get typed payload
    const { TITLE } = result // string
    console.log(TITLE)
  })
  .catch(console.error)

// Get all deals
bitrix.deals.list({ select: ["*", "UF_*"] })
  .then(({ result }) => {
    const titles = result.map((e) => e.TITLE)
    console.log(titles)
  })
  .catch(console.error)
```

## API

The library has two layers:

1. **A low-level client** — takes care of the routine and provides bare-bones methods to work with raw Bitrix methods (see [here](/docs/low-level-api.md)).
2. **Services** — a wrapper around the Bitrix REST operations. Orchestrates low-level client methods and casts returned payloads to proper types (see below). That's what you want to use.

* CRM
  * [Deal](/docs/services/deals.md)
    * [
        [create](/docs/services/deals.md##create-deal---bitrixdealscreate),
        [get](/docs/services/deals.md#get-deal---bitrixdealsget), 
        [list](/docs/services/deals.md#list-deals---bitrixdealslist), 
        [update](/docs/services/deals.md#update-deal---bitrixdealsupdate), 
        delete, 
        fields]
    * [productrows_set, productrows_get]
    * [contact_fields, contact_add, contact_delete]
    * [contact_items_get, contact_items_set, contact_items_delete]
  * Company
    * [create, get, list, update, delete, fields]
    * [contact_fields, contact_add, contact_delete]
    * [contact_items_get, contact_items_set, contact_items_delete]
  * Contact
    * [create, get, list, update, delete, fields]
    * [company_fields, company_add, company_delete]
    * [company_items_get, company_items_set, company_items_delete]
  * [Lead](/docs/services/leads.md)
    * [
        [create](/docs/services/leads.md##create-lead---bitrixleadscreate),
        [get](/docs/services/leads.md#get-lead---bitrixleadsget), 
        [list](/docs/services/leads.md#list-leads---bitrixleadslist), 
        [update](/docs/services/leads.md#update-lead---bitrixleadsupdate), 
        delete, 
        fields]
    * [productrows_set, productrows_get]
  * [Status](/docs/services/statuses.md)
    * [
        [create](/docs/services/statuses.md##create-status---bitrixstatusescreate),
        [get](/docs/services/statuses.md#get-status---bitrixstatusesget), 
        [list](/docs/services/statuses.md#list-statuses---bitrixstatuseslist), 
        [update](/docs/services/statuses.md#update-status---bitrixstatusesupdate), 
        delete, 
        fields]
    * [entity_types, entity_items, extra_fields]
  * Currency
    * [create, get, list, update, delete, fields]
    * [localizations_fields, localizations_get, localizations_set, localizations_delete]
    * [base_set, base_get]
* User
  * [create, get, list, update, delete, fields]
  * [current, search, online, counters]
  * [history_list, history_fields_list]

## FAQ

> Is it finished?

Not yet. What's in the docs already works, and not covered Bitrix operations can be done with a provided low-level client methods.

> I'm not a Typed Language Master Race user. Can I use it with a regular JavaScript?

Sure. Just install and import it as any other NPM module. But The Type Police is already on the way for you.

Note that this library wasn't designed with regular JavaScript in mind, so it doesn't make unnecessary dynamic checks. Don't be too persistent in passing on wrong parameters — it might yield unexpected results. After all, TypeScript is a recommended way to use it.

> Does it handle authentication?

Not yet. You have to init client with already obtained by any legal means access token.

> Should I check payloads `error` properties for errors?

You shouldn't. Catch rejections instead, as the library will reject if there are any errors in a payload.

> List method does not return user fields!

Bitrix API doesn't do that by default. Use wildcards in `select` param to force inclusion of user fields:

```ts
bitrix.deals.list({ select: ['*', 'UF_*'] })
```

> User fields are not typed properly

Client can't know about non-default properties in payloads. Because of that, it assumes that any payload can have any additional fields of type `[key: string]: string`:

```ts
bitrix.leads.get({ ID: '77' })
  .then(({ result }) => {
    // known property of type `string`
    const title = result.TITLE

    // unknown property of type `string`
    const someData = result.UF_23232323

    console.log(title, someData)
  })
```

> I need to call a Bitrix method which isn't supported yet

Use appropriate low-level client methods, like so:

```ts
bitrix.get<SomeNewMethodType>('some.new.get.method' as any, { ID: '77' })
bitrix.list<SomeNewMethodType>('some.new.list.method' as any, { select: ["TITLE"] })
```

> I need to call a specific set of commands. How to do that effectively?

Use the `batch` method. It will handle all routine:

```ts
bitrix.batch<{
  lead: Lead,
  deals: Deal[]
}>({
  lead: { method: Method.GET_LEAD, params: { ID: '77' } },
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
* `npm run coverage` — collect full coverage report
* `npm run build` — build the library for the release
