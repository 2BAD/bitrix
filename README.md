![@2bad/bitrix](https://user-images.githubusercontent.com/4460311/64487745-c4a1ea00-d246-11e9-9d6e-a0b0227c801c.png)

# Bitrix24 REST API client that doesn't suck

[![NPM version](https://img.shields.io/npm/v/@2bad/bitrix)](https://www.npmjs.com/package/@2bad/bitrix)
[![License](https://img.shields.io/npm/l/@2bad/bitrix)](https://www.npmjs.com/package/@2bad/bitrix)
[![Code coverage](https://img.shields.io/codecov/c/github/2BAD/bitrix)](https://codecov.io/gh/2BAD/bitrix)
[![Travis Build Status](https://img.shields.io/travis/2BAD/bitrix?logo=Travis)](https://travis-ci.org/github/2BAD/bitrix)
[![GitHub Build Status](https://img.shields.io/github/workflow/status/2BAD/bitrix/Integration%20testing?logo=GitHub)](https://github.com/2BAD/bitrix/actions?query=workflow%3A%22Integration+testing%22)
[![Dependency Status](https://img.shields.io/david/2BAD/bitrix)](https://david-dm.org/2BAD/bitrix)
[![Written in TypeScript](https://img.shields.io/github/languages/top/2BAD/bitrix)](https://github.com/2BAD/bitrix/search?l=typescript)

- 🔥 No bullshit
- ✨ Expressive API
- 💪 Strongly typed methods and requests results with TypeScript
- 🚀 Handles records batching and rate limiting for you
- ❤️ Promise-based

![@2bad/bitrix usage example](https://user-images.githubusercontent.com/4460311/64130824-7798c080-cdcd-11e9-99f0-7ded87541a85.png)

### Install

```shell
npm install @2bad/bitrix
```

### Usage

Init client with Bitrix API endpoint and access token and use the client to ease your Bitrix pain:

```typescript
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

### Authentication

Before you'll be able to use Bitrix REST API, you need to authenticate.

There are two ways to do that:

1. **A harder, but proper way** — create a Bitrix application and then authenticate with an OAuth.

   Authentication with an OAuth requires some additional steps and that's up to you to deal with it using a lambda function, some server or a Postman.

   That will yield an access token. Use it to init the client:

   ```typescript
   const bitrix = Bitrix('https://PORTAL_NAME.bitrix24.ru/rest', 'ACCESS_TOKEN')
   ```

   Note, that access token lives only 30 minutes and should be refreshed periodically with provided by OAuth refresh token, which in turn lives 1 month.

2. **An easier way** — create a Bitrix inbound webhook with required permissions.

   It will instantly give you an endpoint with a token inside of it. No additional authentication or access tokens required to use it:

   ```typescript
   const bitrix = Bitrix('https://PORTAL_NAME.bitrix24.ru/rest/1/WEBHOOK_TOKEN')
   ```

   That endpoint lives indefinitely. Rejoice and hope that it won't backfire on you.

### API

- Generic
  - [`call()`](docs/methods.md#call)
  - [`list()`](docs/methods.md#list)
  - [`batch()`](docs/methods.md#batch)
- CRM
  - [Company](docs/services/companies.md)
  - [Contact](docs/services/contacts.md)
  - [Currency](docs/services/currencies.md)
  - [Deal](docs/services/deals.md)
  - [Lead](docs/services/leads.md)
  - [Status](docs/services/statuses.md)
- [User](docs/services/users.md)

### How it works

The client tries hard to provide a consistent, strongly typed and at the same time effortless experience.

It takes care of the any necessary batching to run "large" commands, like retrieving all deals or leads with least possible network request. That allows achieving a reading of the 250 000 and updating of 5000 entries per minute with a single line of code.

All client methods are automatically rate-limited and queued if needed to cope with Bitrix REST API limitation of 2 requests per second, so you should never see Bitrix errors about exceeding rate limits.

Methods required params and returned payload types are automatically resolved based on [Methods](source/types.ts) interface, which effectively describes all currently supported methods.

To facilitate better architecture, the client divided into layers:

1. **Methods** — a mostly generic [methods](docs/methods.md) like `call` to work with Bitrix API methods. They take care of the routine and provide a foundation for more complex operations.
2. **Client** — a generic [client](source/client/README.md), which takes care of some additional routine tasks like setting access token on every request, setting up a queue for the rate limiting, and providing generic methods.
3. **Services** — each [service](docs/services/README.md) provides an expressive interface to work with a specific group of Bitrix REST API operations. In essence, they do orchestrate generic client methods and parameters to get proper results.
4. **Bitrix client** — a top-level [provider](source/bitrix.ts) of generic method and services. An effortless way to deal with Bitrix REST API by using an intuitive API, which takes care of all underlying complexity.

### FAQ

> Is it finished?

The core is ready and stable. It can be used to arbitrary invoke any Bitrix REST API methods.

However, not all Bitrix REST API methods are exposed as convenient client services yet \(the ones like `bitrix.deals.list()`\).

If you need specific service, add one by making a Pull Request, following the structure of already existing [services](source/services/README.md) and ["Adding new methods"](./#adding-new-methods) instructions.

> I'm not a Typed Language Master Race user. Can I use it with a regular JavaScript?

Sure. Just install and import it as any other NPM module. But The Type Police is already on the way for you.

Note that this library wasn't designed with regular JavaScript in mind, so it doesn't make unnecessary dynamic checks. Don't be too persistent in passing on wrong parameters — it might yield unexpected results. After all, TypeScript is a recommended way to use it.

> Should I check payloads `error` properties for errors?

You shouldn't. Catch rejections instead, as the library will reject if there are any errors in a payload.

> List method does not return user fields!

Bitrix API doesn't do that by default. Use wildcards in `select` param to force inclusion of user fields:

```typescript
bitrix.deals.list({ select: ['*', 'UF_*'] })
```

> User fields are not typed properly

Client can't know about non-default properties in payloads. Because of that, it assumes that any payload can have any additional fields of type `[key: string]: string`:

```typescript
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

Use appropriate low-level client methods with a casting, like so:

```typescript
bitrix.call('some.new.get' as any, { ID: '77' } as any)
  .then((payload) => payload as GetPayload<NewPayload>)

bitrix.list('some.new.list' as any, { select: ["TITLE"] })
  .then((payload) => payload as ListPayload<NewPayload>)
```

> I need to call a specific set of commands. How to do that effectively?

Use the `batch` method. It will handle all routine:

```typescript
bitrix.batch({
  lead: { method: Method.GET_LEAD, params: { ID: '77' } },
  deals: { method: Method.LIST_DEALS, params: {} }
})
```

### Development

- `npm test` — run all tests and collect full coverage report
- `npm run test:unit` — run unit tests and collect coverage report
- `npm run test:integration` — run integration tests and collect coverage report
- `npm run test:watch` — watch for changes and run all tests
- `npm run test:unit:watch` — watch for changes and run unit tests
- `npm run test:integration:watch` — watch for changes and run integration tests
- `npm run build` — build the library for the release

#### Adding new methods

Proper method parameters and payload types handling requires some routine when adding any new method. Hopefully, we can do it better in future, but for now follow those steps:

1. Add new method into the [`Method`](source/methods.ts) enum.
2. Add it into the [`LISTABLE_METHODS`](source/methods.ts) array if it is listable \(paginated\). Not everything that lists is listable, so check it.
3. Add or update related [service](source/services/README.md):
   1. Put exposed by the service public methods into the `index.ts` file. Ensure that you're properly mapping service method arguments to `call` or `list` params.
   2. Add related entities into the `entities.ts`.
   3. Add interface describing service methods into the `methods.ts`. Test and check method payload type to be sure you've described it correctly!
   4. Extend [`Methods`](source/methods.ts) interface with the added service-specific interface. That way the client will know how to resolve parameters and payload types for the added method.
   5. Add tests into the `index.unit.test.ts`.
4. Re-export service public types like Entities in the [bitrix.ts](source/bitrix.ts) to make them available to the end-users.
5. Document addition in the [docs](docs/README.md).
