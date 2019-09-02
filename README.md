# @2bad/bitrix

<p align='center'>
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

> Bitrix24 REST API client that doesn't suck

## Features

* 🔥 No bullshit
* ✨ Expressive API
* 💪 Strongly typed methods and requests results with TypeScript
* ❤️ Promise-based

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

1. **A low-level client** — takes care of the routine and provides bare-bones methods to work with raw Bitrix methods.
2. **Services** — a wrapper around the Bitrix REST operations. Orchestrates low-level client methods and casts returned payloads to proper types. That's what you want to use.

### Deals service

Work with Bitrix CRM deals

#### Get deal

Retrieve specified deal

```ts
bitrix.deals.get('77')
```

##### Arguments

* `id: string` — `ID` of the deal to retrieve.

##### Returns

`Promise<GetPayload<Deal>>` (See [Deal](/2BAD/bitrix/blob/master/source/services/types/deal.ts))

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

Work with Bitrix CRM leads

#### Get lead

Retrieve specified lead

```ts
bitrix.leads.get('77')
```

##### Arguments

* `id: string` — `ID` of the lead to retrieve.

##### Returns

`Promise<GetPayload<Lead>>` (See [Lead](/2BAD/bitrix/blob/master/source/services/types/lead.ts))

<details>
<summary>See payload example</summary>

```ts
// @todo Add
```

</details>

#### Get leads

Retrieve all leads.

If there are more than 2500 leads, it will dispatch multiple requests to get all leads.

```ts
bitrix.leads.list({ select: ['*', 'UF_*'] })
```

##### Arguments

* `params?: ListParams` — params to be passed with an API request

   _Hints:_

   * Specify `{ select: ['*', 'UF_*'] }` to get user fields too.
   * Specify `start` if you want to skip some entries.

##### Returns

`Promise<ListPayload<Lead>>`

<details>
<summary>See payload example</summary>

```ts
// @todo Add
```

</details>

### Statuses service

Work with Bitrix CRM statuses

#### Get status

Retrieve specified status

```ts
bitrix.statuses.get('77')
```

##### Arguments

* `id: string` — `ID` of the status to retrieve.

##### Returns

`Promise<GetPayload<Status>>` (See [Status](/2BAD/bitrix/blob/master/source/services/types/status.ts))

<details>
<summary>See payload example</summary>

```ts
// @todo Add
```

</details>

#### Get statuses

Retrieve all statuses.

If there are more than 2500 statuses, it will dispatch multiple requests to get all statuses.

```ts
bitrix.statuses.list({ select: ['*', 'UF_*'] })
```

##### Arguments

* `params?: ListParams` — params to be passed with an API request

   _Hints:_

   * Specify `{ select: ['*', 'UF_*'] }` to get user fields too.
   * Specify `start` if you want to skip some entries.

##### Returns

`Promise<ListPayload<Status>>`

<details>
<summary>See payload example</summary>

```ts
// @todo Add
```

</details>

### Low-level methods

Those are bare-bones methods which are responsible for taking care of the routine, error handling and types casting.

They are used by the services internally and provided as a part of the public API for very specific use cases.

Usually, _you do not want to use those directly_. They will force you to take care of the payload typing and be sure to use Bitrix REST method with appropriate client method, otherwise, you'll get incorrect payload wrapping type.

Though, you might find useful a `batch` method which makes a series of Bitrix REST operation with only a few requests.

#### `get`

A generic method for executing any Bitrix method which involves retrieval of the single entry. Usually, those contain `get` word in the method, like `crm.deal.get`.

Note that method can't know which entity will it return, so its type might be provided as `<P>` generic. Otherwise, it will be of type `unknown`.

```ts
import Bitrix, { Method, Deal } from '@2bad/bitrix'

// ...init client...

bitrix.get<Deal>(Method.GET_DEAL, { ID: '77' })
```

##### Generics

* `<P> = unknown` — a payload type. It will be wrapped into the `GetPayload<P>`, so you could get suggestions while accessing the result properties.

##### Arguments

* `method: GettableMethod` — any method that retrieves single entry, like `crm.deal.get`. Be sure to use `Method` enum here.

   The method will disallow to specify any Bitrix method which returns non-list payload. However, if you need to use something new or unsupported, consult Bitrix REST API documentation (ha, a joke!) to figure out does Bitrix method in question returns payload of type `GetPayload<P>`.

* `params?: GetParams` — params to be passed with an API request

##### Rejects

* `Error` — a Got error, when an error received as a response

##### Returns

`Promise<GetPayload<P>>`

#### `getList`

A generic method for executing any Bitrix method which involves retrieval of the list. Usually, those contain `list` word in the method, like `crm.deal.list`.

On contrary to the `list` method, which _retrieves all entries_, even if they can't be retrieved with a single request, this one _gets only 50 entries per request_.

Note that method can't know which entity will it return, so its type might be provided as a `<P>` generic. Otherwise, it will be of type `unknown`.

```ts
import Bitrix, { Method, Deal } from '@2bad/bitrix'

// ...init client...

bitrix.getList<Deal>(Method.LIST_DEALS, { start: 774 })
```

##### Generics

* `<P> = unknown` — a payload type. It will be wrapped into the `ListPayload<P>`, so you could get suggestions while accessing the result properties.

##### Arguments

* `method: ListableMethod` — any method that retrieves multiple entries, like `crm.deal.list`. Be sure to use `Method` enum here.

   The client will disallow to specify any Bitrix method which returns non-list payload. However, if you need to use something new or unsupported, consult Bitrix REST API documentation to figure out does Bitrix method in question returns payload of type `ListPayload<P>`.

* `params?: ListParams` — params to be passed with an API request, like `start`, `select`, `filter` or `order`.

##### Rejects

* `Error` — a Got error, when an error received as a response
* `Error` — when payload contains `result.error` property.

##### Returns

`Promise<ListPayload<P>>`

#### `list`

A compound method for executing any Bitrix method which involves retrieval of the list. Usually, those contain `list` word in the method, like `crm.deal.list`.

Retrieves _all entries_ ("pages") by executing the necessary amount of batch requests with specified Bitrix method.

Note that method can't know which entities will it return, so its type might be provided as a `<P>` generic. Otherwise, it will be of type `unknown`.

```ts
import Bitrix, { Method, Deal } from '@2bad/bitrix'

// ...init client...

bitrix.getList<Deal>(Method.LIST_DEALS, { start: 774 })
```

##### Generics

* `<P> = unknown` — a payload type. It will be wrapped into the `ListPayload<P>`, so you could get suggestions while accessing the result properties.

##### Arguments

* `method: ListableMethod` — any method that retrieves multiple entries, like `crm.deal.list`. Be sure to use `Method` enum here.

   The method will disallow to specify any Bitrix method which returns non-list payload. However, if you need to use something new or unsupported, consult Bitrix REST API documentation to figure out does Bitrix method in question returns payload of type `ListPayload<P>`.

* `params?: ListParams` — params to be passed with an API request, like `start`, `select`, `filter` or `order`.

##### Rejects

* `Error` — a Got error, when an error received as a response
* `Error` — when payload contains `result.error` property.

##### Returns

`Promise<ListPayload<P>>`

#### `batch`

Executes a series of Bitrix methods within as few as possible requests (using `/batch` Bitrix API endpoint).

If the amount of commands exceeds max allowed by the Bitrix API commands per batch (50 per batch), they will be chunked into standalone request and merged upon completion.

Note that the method can't know which entities will it return. A mapping of commands name to types can be provided as `<CPM>` generic. Otherwise, it will be an object with properties of type `unknown`.

```ts
import Bitrix, { Method, Deal } from '@2bad/bitrix'

// ...init client...

batch<{
  deals: readonly Deal[]
  deal: Deal
}>({
 deals: { method. Method.LIST_DEALS },
 deal: { method. Method.GET_DEAL, params: { ID: '77' } }
})
```

##### Generics

* `<CPM>` — commands to payload type map. It will be wrapped into the `BatchPayload<CPM>`, so you could get suggestions while accessing the result properties.

   It can be either a generic object, which won't provide any good suggestions while coding but useful when providing a simple array of commands:

   ```ts
   // Assumes that all responses will contain either `Deal[]` or `Lead`
   batch<Record<string, readonly Deal[] | Lead>>([
    { method. Method.LIST_DEALS },
    { method. Method.GET_LEAD, params: { ID: '77' } }
   ])
   ```

   However, in such case it is recommended to use a tuple with a `as const` of array of commands. That way it will be easier to get accurately typed results:

   ```ts
   batch<[Deal[], Lead]>([
    { method. Method.LIST_DEALS },
    { method. Method.GET_LEAD, params: { ID: 11 } }
   ] as const)
     .then(({ result }) => {
       const [deals, lead] = result
     })
   ```

   Or when used with named commands, it can be an interface to provide an accurate mapping from commands names to their types:

   ```ts
   batch<{
     dealsList: readonly Deal[]
     someLead: Lead
   }>({
    dealsList: { method. Method.LIST_DEALS },
    someLead: { method. Method.GET_LEAD, params: { ID: 11 } }
   })
    .then(({ result }) => result.dealList)
   ```

   That generic is tightly coupled with the `commands` argument. Their types and shapes should match, otherwise TypeScript will be unhappy.

##### Arguments

* `commands: Commands` — an array of commands to execute, or an object of commands, like so:

   ```ts
    const arrayOfCommands = [
      { method: Method.GET_DEAL },
      { method: Method.GET_LEAD }
    ] as const

    const namedCommands = {
      one: { method: Method.GET_DEAL },
      two: { method: Method.GET_LEAD }
     } as const
   ```

   The payload will depend on that format. In case of an array of commands, it will be of type `P[]`, and in case of the named commands, an object of similar shape will be returned.

   Note that if `<CPM>` provided, the method will strictly demand properties of the `commands` and `<CPM>` to match.

* `commandsPerRequest: number = MAX_COMMANDS_PER_BATCH` — how much commands to cramp into the single request. Usually, it shouldn't be changed. The default value is `50`, a max allowed by the Bitrix API.

##### Rejects

* `Error` — a Got error, when an error received as a response
* `Error` — when any payload contains errors in the `result.result_error` property.

##### Returns

`Promise<BatchPayload<CPM>>`

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
