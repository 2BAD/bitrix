# @2bad/bitrix

> Bitrix24 REST API client that doesn't suck

---

<p align='center'>
  <a href='https://www.npmjs.com/package/@2bad/bitrix'>
    <img src='https://img.shields.io/npm/v/@2bad/bitrix.svg' alt='NPM version' />
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

**Features:**

* 🔥 No bullshit
* ✨ Expressive API
* 💪 Strongly typed methods and requests results with TypeScript
* ❤️ Promise-based

## Getting Started

Install using NPM:

```shell
npm install @2bad/bitrix
```

Init client with Bitrix API endpoint and authentication token:

```ts
import Bitrix from '@2bad/bitrix'

const bitrix = Bitrix('https://YOUR_DOMAIN.bitrix24.ru/rest', 'YOUR_AUTH_TOKEN')
```

Finally, use the client to ease your Bitrix pain:

```ts
import Bitrix from '@2bad/bitrix'

const bitrix = Bitrix('https://YOUR_DOMAIN.bitrix24.ru/rest', 'YOUR_AUTH_TOKEN')

// Get deal
bitrix.deals.get({ ID: 77 })
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

1. **A low-level client** — takes care of the routine and provides bare-bones methods to work with raw Bitrix methods.
2. **Services** — a wrapper around the Bitrix REST operations. Orchestrates low-level client methods and casts returned payloads to proper types. That's what you want to use.

### Deals service

Work with Bitrix CRM deals

#### Type

See [Deal](/2BAD/bitrix/blob/master/source/services/types.ts).

#### Get deal

Retrieve specified deal

```ts
bitrix.deals.get({ ID: 77 })
```

##### Arguments

* `params: GetParams` — params to be passed with the API request.

   Usually, you want to specify at least `ID` of the deal to retrieve.

##### Returns

`Promise<GetPayload<Deal>>`

<details>
<summary>See payload example</summary>

```ts
{
  result: {
    ID: '77',
    TITLE: 'RE: Hello',
    HONORIFIC: null,
    NAME: 'hello@example.com',
    SECOND_NAME: '',
    LAST_NAME: '',
    COMPANY_TITLE: '',
    COMPANY_ID: '7744',
    CONTACT_ID: '47',
    IS_RETURN_CUSTOMER: 'Y',
    BIRTHDATE: '',
    SOURCE_ID: 'EMAIL',
    SOURCE_DESCRIPTION: null,
    STATUS_ID: 'CONVERTED',
    STATUS_DESCRIPTION: null,
    POST: '',
    COMMENTS: 'RE: Hello',
    CURRENCY_ID: 'USD',
    OPPORTUNITY: '0.00',
    HAS_PHONE: 'N',
    HAS_EMAIL: 'Y',
    HAS_IMOL: 'N',
    ASSIGNED_BY_ID: '17',
    CREATED_BY_ID: '17',
    MODIFY_BY_ID: '1',
    DATE_CREATE: '2018-06-05T09:59:22+03:00',
    DATE_MODIFY: '2019-07-22T23:39:46+03:00',
    DATE_CLOSED: '2018-07-04T03:20:31+03:00',
    STATUS_SEMANTIC_ID: 'S',
    OPENED: 'Y',
    ORIGINATOR_ID: 'email-tracker',
    ORIGIN_ID: '7',
    ADDRESS: null,
    ADDRESS_2: null,
    ADDRESS_CITY: null,
    ADDRESS_POSTAL_CODE: null,
    ADDRESS_REGION: null,
    ADDRESS_PROVINCE: null,
    ADDRESS_COUNTRY: null,
    ADDRESS_COUNTRY_CODE: null,
    UTM_SOURCE: null,
    UTM_MEDIUM: null,
    UTM_CAMPAIGN: null,
    UTM_CONTENT: null,
    UTM_TERM: null,
    EMAIL: [
      { ID: '774', VALUE_TYPE: 'WORK', VALUE: 'hello@example.com', TYPE_ID: 'EMAIL' }
    ]
  },
  time: {
    start: 1567372034.625375,
    finish: 1567372034.8204,
    duration: 0.19502496719360352,
    processing: 0.03838515281677246,
    date_start: "2019-09-02T00:07:14+03:00",
    date_finish: "2019-09-02T00:07:14+03:00"
  }
}
```

</details>

#### Get deals

Retrieve all deals.

If there are more than 2500 deals, it will dispatch multiple requests to get all deals.

```ts
bitrix.deals.list({ select: ['*', 'UF_*'] })
```

##### Arguments

* `params?: ListParams` — params to be passed with an API request

   _Hints:_

   * Specify `{ select: ['*', 'UF_*'] }` to get user fields too.
   * Specify `start` if you want to skip some entries.

##### Returns

`Promise<ListPayload<Deal>>`

<details>
<summary>See payload example</summary>

```ts
{
  result: [{
    ID: '77',
    TITLE: 'RE: Hello',
    HONORIFIC: null,
    NAME: 'hello@example.com',
    SECOND_NAME: '',
    LAST_NAME: '',
    COMPANY_TITLE: '',
    COMPANY_ID: '7744',
    CONTACT_ID: '47',
    IS_RETURN_CUSTOMER: 'Y',
    BIRTHDATE: '',
    SOURCE_ID: 'EMAIL',
    SOURCE_DESCRIPTION: null,
    STATUS_ID: 'CONVERTED',
    STATUS_DESCRIPTION: null,
    POST: '',
    COMMENTS: 'RE: Hello',
    CURRENCY_ID: 'USD',
    OPPORTUNITY: '0.00',
    HAS_PHONE: 'N',
    HAS_EMAIL: 'Y',
    HAS_IMOL: 'N',
    ASSIGNED_BY_ID: '17',
    CREATED_BY_ID: '17',
    MODIFY_BY_ID: '1',
    DATE_CREATE: '2018-06-05T09:59:22+03:00',
    DATE_MODIFY: '2019-07-22T23:39:46+03:00',
    DATE_CLOSED: '2018-07-04T03:20:31+03:00',
    STATUS_SEMANTIC_ID: 'S',
    OPENED: 'Y',
    ORIGINATOR_ID: 'email-tracker',
    ORIGIN_ID: '7',
    ADDRESS: null,
    ADDRESS_2: null,
    ADDRESS_CITY: null,
    ADDRESS_POSTAL_CODE: null,
    ADDRESS_REGION: null,
    ADDRESS_PROVINCE: null,
    ADDRESS_COUNTRY: null,
    ADDRESS_COUNTRY_CODE: null,
    UTM_SOURCE: null,
    UTM_MEDIUM: null,
    UTM_CAMPAIGN: null,
    UTM_CONTENT: null,
    UTM_TERM: null,
    EMAIL: [
      { ID: '774', VALUE_TYPE: 'WORK', VALUE: 'hello@example.com', TYPE_ID: 'EMAIL' }
    ]
  }],
  error: 'Possible error',
  next: 2,
  time: {
    start: 1567372034.625375,
    finish: 1567372034.8204,
    duration: 0.19502496719360352,
    processing: 0.03838515281677246,
    date_start: "2019-09-02T00:07:14+03:00",
    date_finish: "2019-09-02T00:07:14+03:00"
  },
  total: 7
}
```

</details>

### Leads service

_TODO_

### Statuses service

_TODO_

### Low-level methods

Use those only for edge cases, as they will force you to take care of the payload typing. Besides, since Bitrix has a varying structure of payload for different methods, you must be sure that you're using Bitrix REST method with appropriate client method to get correct payload wrapping type.

The only exclusion is a `batch` method which allows making a series of Bitrix REST operation with only one request.

_TODO_

## Testing examples

```ts
import Bitrix from '@2bad/bitrix'
import { Method } from './bitrix/types'

const bitrix = Bitrix('https://YOUR_DOMAIN.bitrix24.ru/rest', 'YOUR_AUTH_TOKEN')

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
```

## FAQ

> Is it finished?

Not yet. What's in the docs already works, and not covered Bitrix operations can be done with a provided low-level client methods.

> Does it handle authentication?

Not yet. You have to init client with already obtained by any legal means authentication token.

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
bitrix.leads.get({ ID: 77 })
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
bitrix.get<SomeNewMethodType>('some.new.get.method' as any, { ID: 77 })
bitrix.list<SomeNewMethodType>('some.new.list.method' as any, { select: ["TITLE"] })
```

> I need to call a specific set of commands. How to do that effectively?

Use the `batch` method. It will handle all routine:

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
* `npm run coverage` — collect full coverage report
* `npm run build` — build the library for the release
