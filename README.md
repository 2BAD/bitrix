![@2bad/bitrix](https://user-images.githubusercontent.com/4460311/64487745-c4a1ea00-d246-11e9-9d6e-a0b0227c801c.png)

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
* 🚀 Handles records batching and rate limiting for you
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

* [call](/docs/methods.md#call)
* [list](/docs/methods.md#list)
* [batch](/docs/methods.md#batch)

### CRM

#### [Deal](/docs/services/deals.md)

| Bitrix method                   | Enum method                            | API                                                                                 |
| :------------------------------ | :------------------------------------- | :---------------------------------------------------------------------------------- |
| `crm.deal.add`                  | `METHOD.CRM_DEAL_ADD`                  | [`bitrix.deals.create()`](/docs/services/deals.md##create-deal---bitrixdealscreate) |
| `crm.deal.contact.add`          | `METHOD.CRM_DEAL_CONTACT_ADD`          |                                                                                     |
| `crm.deal.contact.delete`       | `METHOD.CRM_DEAL_CONTACT_DELETE`       |                                                                                     |
| `crm.deal.contact.fields`       | `METHOD.CRM_DEAL_CONTACT_FIELDS`       |                                                                                     |
| `crm.deal.contact.items.delete` | `METHOD.CRM_DEAL_CONTACT_ITEMS_DELETE` |                                                                                     |
| `crm.deal.contact.items.get`    | `METHOD.CRM_DEAL_CONTACT_ITEMS_GET`    |                                                                                     |
| `crm.deal.contact.items.set`    | `METHOD.CRM_DEAL_CONTACT_ITEMS_SET`    |                                                                                     |
| `crm.deal.delete`               | `METHOD.CRM_DEAL_DELETE`               |                                                                                     |
| `crm.deal.fields`               | `METHOD.CRM_DEAL_FIELDS`               |                                                                                     |
| `crm.deal.get`                  | `METHOD.CRM_DEAL_GET`                  | [`bitrix.deals.get()`](/docs/services/deals.md#get-deal---bitrixdealsget)           |
| `crm.deal.list`                 | `METHOD.CRM_DEAL_LIST`                 | [`bitrix.deals.list()`](/docs/services/deals.md#list-deals---bitrixdealslist)       |
| `crm.deal.productrows.get`      | `METHOD.CRM_DEAL_PRODUCTROWS_GET`      |                                                                                     |
| `crm.deal.productrows.set`      | `METHOD.CRM_DEAL_PRODUCTROWS_SET`      |                                                                                     |
| `crm.deal.recurring.add`        | `METHOD.CRM_DEAL_RECURRING_ADD`        |                                                                                     |
| `crm.deal.recurring.delete`     | `METHOD.CRM_DEAL_RECURRING_DELETE`     |                                                                                     |
| `crm.deal.recurring.expose`     | `METHOD.CRM_DEAL_RECURRING_EXPOSE`     |                                                                                     |
| `crm.deal.recurring.fields`     | `METHOD.CRM_DEAL_RECURRING_FIELDS`     |                                                                                     |
| `crm.deal.recurring.get`        | `METHOD.CRM_DEAL_RECURRING_GET`        |                                                                                     |
| `crm.deal.recurring.list`       | `METHOD.CRM_DEAL_RECURRING_LIST`       |                                                                                     |
| `crm.deal.recurring.update`     | `METHOD.CRM_DEAL_RECURRING_UPDATE`     |                                                                                     |
| `crm.deal.update`               | `METHOD.CRM_DEAL_UPDATE`               | [`bitrix.deals.update()`](/docs/services/deals.md#update-deal---bitrixdealsupdate)  |
| `crm.deal.userfield.add`        | `METHOD.CRM_DEAL_USERFIELD_ADD`        |                                                                                     |
| `crm.deal.userfield.delete`     | `METHOD.CRM_DEAL_USERFIELD_DELETE`     |                                                                                     |
| `crm.deal.userfield.get`        | `METHOD.CRM_DEAL_USERFIELD_GET`        |                                                                                     |
| `crm.deal.userfield.list`       | `METHOD.CRM_DEAL_USERFIELD_LIST`       |                                                                                     |
| `crm.deal.userfield.update`     | `METHOD.CRM_DEAL_USERFIELD_UPDATE`     |                                                                                     |

#### Currency

| Bitrix method                       | Enum method                                | API  |
| :---------------------------------- | :----------------------------------------- | :--- |
| `crm.currency.add`                  | `METHOD.CRM_CURRENCY_ADD`                  |      |
| `crm.currency.base.get`             | `METHOD.CRM_CURRENCY_BASE_GET`             |      |
| `crm.currency.base.set`             | `METHOD.CRM_CURRENCY_BASE_SET`             |      |
| `crm.currency.delete`               | `METHOD.CRM_CURRENCY_DELETE`               |      |
| `crm.currency.fields`               | `METHOD.CRM_CURRENCY_FIELDS`               |      |
| `crm.currency.get`                  | `METHOD.CRM_CURRENCY_GET`                  |      |
| `crm.currency.list`                 | `METHOD.CRM_CURRENCY_LIST`                 |      |
| `crm.currency.localizations.delete` | `METHOD.CRM_CURRENCY_LOCALIZATIONS_DELETE` |      |
| `crm.currency.localizations.fields` | `METHOD.CRM_CURRENCY_LOCALIZATIONS_FIELDS` |      |
| `crm.currency.localizations.get`    | `METHOD.CRM_CURRENCY_LOCALIZATIONS_GET`    |      |
| `crm.currency.localizations.set`    | `METHOD.CRM_CURRENCY_LOCALIZATIONS_SET`    |      |
| `crm.currency.update`               | `METHOD.CRM_CURRENCY_UPDATE`               |      |

#### Company

| Bitrix method                      | Enum method                               | API  |
| :--------------------------------- | :---------------------------------------- | :--- |
| `crm.company.add`                  | `METHOD.CRM_COMPANY_ADD`                  |      |
| `crm.company.contact.add`          | `METHOD.CRM_COMPANY_CONTACT_ADD`          |      |
| `crm.company.contact.delete`       | `METHOD.CRM_COMPANY_CONTACT_DELETE`       |      |
| `crm.company.contact.fields`       | `METHOD.CRM_COMPANY_CONTACT_FIELDS`       |      |
| `crm.company.contact.items.delete` | `METHOD.CRM_COMPANY_CONTACT_ITEMS_DELETE` |      |
| `crm.company.contact.items.get`    | `METHOD.CRM_COMPANY_CONTACT_ITEMS_GET`    |      |
| `crm.company.contact.items.set`    | `METHOD.CRM_COMPANY_CONTACT_ITEMS_SET`    |      |
| `crm.company.delete`               | `METHOD.CRM_COMPANY_DELETE`               |      |
| `crm.company.fields`               | `METHOD.CRM_COMPANY_FIELDS`               |      |
| `crm.company.get`                  | `METHOD.CRM_COMPANY_GET`                  |      |
| `crm.company.list`                 | `METHOD.CRM_COMPANY_LIST`                 |      |
| `crm.company.update`               | `METHOD.CRM_COMPANY_UPDATE`               |      |
| `crm.company.userfield.add`        | `METHOD.CRM_COMPANY_USERFIELD_ADD`        |      |
| `crm.company.userfield.delete`     | `METHOD.CRM_COMPANY_USERFIELD_DELETE`     |      |
| `crm.company.userfield.get`        | `METHOD.CRM_COMPANY_USERFIELD_GET`        |      |
| `crm.company.userfield.list`       | `METHOD.CRM_COMPANY_USERFIELD_LIST`       |      |
| `crm.company.userfield.update`     | `METHOD.CRM_COMPANY_USERFIELD_UPDATE`     |      |

#### Contacts

| Bitrix method                      | Enum method                               | API  |
| :--------------------------------- | :---------------------------------------- | :--- |
| `crm.contact.add`                  | `METHOD.CRM_CONTACT_ADD`                  |      |
| `crm.contact.company.add`          | `METHOD.CRM_CONTACT_COMPANY_ADD`          |      |
| `crm.contact.company.delete`       | `METHOD.CRM_CONTACT_COMPANY_DELETE`       |      |
| `crm.contact.company.fields`       | `METHOD.CRM_CONTACT_COMPANY_FIELDS`       |      |
| `crm.contact.company.items.delete` | `METHOD.CRM_CONTACT_COMPANY.ITEMS_DELETE` |      |
| `crm.contact.company.items.get`    | `METHOD.CRM_CONTACT_COMPANY.ITEMS_GET`    |      |
| `crm.contact.company.items.set`    | `METHOD.CRM_CONTACT_COMPANY.ITEMS_SET`    |      |
| `crm.contact.delete`               | `METHOD.CRM_CONTACT_DELETE`               |      |
| `crm.contact.fields`               | `METHOD.CRM_CONTACT_FIELDS`               |      |
| `crm.contact.get`                  | `METHOD.CRM_CONTACT_GET`                  |      |
| `crm.contact.list`                 | `METHOD.CRM_CONTACT_LIST`                 |      |
| `crm.contact.update`               | `METHOD.CRM_CONTACT_UPDATE`               |      |
| `crm.contact.userfield.add`        | `METHOD.CRM_CONTACT_USERFIELD_ADD`        |      |
| `crm.contact.userfield.delete`     | `METHOD.CRM_CONTACT_USERFIELD_DELETE`     |      |
| `crm.contact.userfield.get`        | `METHOD.CRM_CONTACT_USERFIELD_GET`        |      |
| `crm.contact.userfield.list`       | `METHOD.CRM_CONTACT_USERFIELD_LIST`       |      |
| `crm.contact.userfield.update`     | `METHOD.CRM_CONTACT_USERFIELD_UPDATE`     |      |

#### [Lead](/docs/services/leads.md)

| Bitrix method               | Enum method                        | API                                                                                 |
| :-------------------------- | :--------------------------------- | :---------------------------------------------------------------------------------- |
| `crm.lead.add`              | `METHOD.CRM_LEAD_ADD`              | [`bitrix.leads.create()`](/docs/services/leads.md##create-lead---bitrixleadscreate) |
| `crm.lead.delete`           | `METHOD.CRM_LEAD_DELETE`           |                                                                                     |
| `crm.lead.fields`           | `METHOD.CRM_LEAD_FIELDS`           |                                                                                     |
| `crm.lead.get`              | `METHOD.CRM_LEAD_GET`              | [`bitrix.leads.get()`](/docs/services/leads.md#get-lead---bitrixleadsget)           |
| `crm.lead.list`             | `METHOD.CRM_LEAD_LIST`             | [`bitrix.leads.list()`](/docs/services/leads.md#list-leads---bitrixleadslist)       |
| `crm.lead.productrows.get`  | `METHOD.CRM_LEAD.PRODUCTROWS_GET`  |                                                                                     |
| `crm.lead.productrows.set`  | `METHOD.CRM_LEAD.PRODUCTROWS_SET`  |                                                                                     |
| `crm.lead.update`           | `METHOD.CRM_LEAD_UPDATE`           | [`bitrix.leads.update()`](/docs/services/leads.md#update-lead---bitrixleadsupdate)  |
| `crm.lead.userfield.add`    | `METHOD.CRM_LEAD_USERFIELD_ADD`    |                                                                                     |
| `crm.lead.userfield.delete` | `METHOD.CRM_LEAD_USERFIELD_DELETE` |                                                                                     |
| `crm.lead.userfield.get`    | `METHOD.CRM_LEAD_USERFIELD_GET`    |                                                                                     |
| `crm.lead.userfield.list`   | `METHOD.CRM_LEAD_USERFIELD_LIST`   |                                                                                     |
| `crm.lead.userfield.update` | `METHOD.CRM_LEAD_USERFIELD_UPDATE` |                                                                                     |

#### [Status](/docs/services/statuses.md)

| Bitrix method             | Enum method                      | API                                                                                            |
| :------------------------ | :------------------------------- | :--------------------------------------------------------------------------------------------- |
| `crm.status.fields`       | `METHOD.CRM_STATUS_FIELDS`       |                                                                                                |
| `crm.status.entity.types` | `METHOD.CRM_STATUS_ENTITY_TYPES` |                                                                                                |
| `crm.status.entity.items` | `METHOD.CRM_STATUS_ENTITY_ITEMS` |                                                                                                |
| `crm.status.add`          | `METHOD.CRM_STATUS_ADD`          | [`bitrix.statuses.create()`](/docs/services/statuses.md##create-status---bitrixstatusescreate) |
| `crm.status.delete`       | `METHOD.CRM_STATUS_DELETE`       |                                                                                                |
| `crm.status.get`          | `METHOD.CRM_STATUS_GET`          | [`bitrix.statuses.get()`](/docs/services/statuses.md#get-status---bitrixstatusesget)           |
| `crm.status.list`         | `METHOD.CRM_STATUS_LIST`         | [`bitrix.statuses.list()`](/docs/services/statuses.md#list-statuses---bitrixstatuseslist)      |
| `crm.status.update`       | `METHOD.CRM_STATUS_UPDATE`       | [`bitrix.statuses.update()`](/docs/services/statuses.md#update-status---bitrixstatusesupdate)  |

### Users

| Bitrix method  | Enum method           | API  |
| :------------- | :-------------------- | :--- |
| `user.fields`  | `METHOD.USER_FIELDS`  |      |
| `user.current` | `METHOD.USER_CURRENT` |      |
| `user.add`     | `METHOD.USER_ADD`     |      |
| `user.update`  | `METHOD.USER_UPDATE`  |      |
| `user.get`     | `METHOD.USER_GET`     |      |
| `user.search`  | `METHOD.USER_SEARCH`  |      |

## How it works

Our client tries hard to provide a consistent, strongly typed and at the same time effortless experience.

It takes care of the any necessary batching to run "large" commands, like retrieving all deals or leads with least possible network request. That allows achieving a reading of the 250 000 and updating of 5000 entries per minute with a single line of code.

All client methods are automatically rate-limited and queued if needed to cope with Bitrix REST API limitation of 2 requests per second, so you should never see Bitrix erroring about exceeding rate limits.

Methods required params and returned payload types are automatically resolved based on [Methods](source/types.ts) interface, which effectively describes all currently supported methods.

To facilitate better architecture, the client divided into layers:

1. **Methods** — a mostly generic [methods](/docs/methods.md) like `call` to work with Bitrix API methods. They take care of the routine and provide a foundation for more complex operations.
2. **Client** — a generic [client](/source/client), which takes care of some additional routine tasks like setting access token on every request, setting up a queue for the rate limiting, and providing generic methods.
3. **Services** — each [service](/docs/services) provides an expressive interface to work with a specific group of Bitrix REST API operations. In essence, they do orchestrate generic client methods and parameters to get proper results.
4. **Bitrix client** — a top-level [provider](/source/bitrix.ts) of generic method and services. An effortless way to deal with Bitrix REST API by using an intuitive API, which takes care of all underlying complexity.

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

Use appropriate low-level client methods with a casting, like so:

```ts
bitrix.call('some.new.get' as any, { ID: '77' } as any)
  .then((payload) => payload as GetPayload<NewPayload>)

bitrix.list('some.new.list' as any, { select: ["TITLE"] })
  .then((payload) => payload as ListPayload<NewPayload>)
```

> I need to call a specific set of commands. How to do that effectively?

Use the `batch` method. It will handle all routine:

```ts
bitrix.batch({
  lead: { method: Method.GET_LEAD, params: { ID: '77' } },
  deals: { method: Method.LIST_DEALS, params: {} }
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

### Adding new methods

Proper method parameters and payload types handling requires some routine when adding any new method. Hopefully, we can do it better in future, but for now follow those steps:

1. Add new method into the [`Method`](/source/method.types.ts) enum.
2. Add it into the [`LISTABLE_METHODS`](/source/method.types.ts) array if it is listable (paginated). Not everything that lists is listable, so check it.
3. Add or update related [service](/source/services):

   1. Put exposed by the service public methods into the `index.ts` file. Ensure that you're properly mapping service method arguments to `call` or `list` params.
   2. Add related entities into the `entities.ts`.
   3. Add interface describing service methods into the `methods.ts`. Test and check method payload type to be sure you've described it correctly!
   4. Extend [`Methods`](/source/method.types.ts) interface with the added service-specific interface. That way the client will know how to resolve parameters and payload types for the added method.
   5. Add tests into the `index.unit.test.ts`.

4. Re-export service public types like Entities in the [bitrix.ts](/source/bitrix.ts) to make them available to the end-users.
5. Document addition in the [docs](/docs).
