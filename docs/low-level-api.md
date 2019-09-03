# Low-level API

Those are bare-bones methods which are responsible for taking care of the routine, error handling and types casting.

They are used by the services internally and provided as a part of the public API for very specific use cases.

Usually, _you do not want to use those directly_. They will force you to take care of the payload typing and be sure to use Bitrix REST method with appropriate client method, otherwise, you'll get incorrect payload wrapping type.

Though, you might find useful a `batch` method which makes a series of Bitrix REST operation with only a few requests.

## `get`

A generic method for executing any Bitrix method which involves work with a single entry. Usually, those contain `create`, `get` or `update` words in the method, like `crm.deal.get`.

Note that method can't know which entity will it return, so its type might be provided as `<P>` generic. Otherwise, it will be of type `unknown`.

```ts
import Bitrix, { Method, Deal } from '@2bad/bitrix'

// ...init client...

bitrix.get<Deal>(Method.GET_DEAL, { ID: '77' })

bitrix.get<number>(Method.CREATE_DEAL, {
  fields: { TITLE: 'New deal' },
  params: { REGISTER_SONET_EVENT: 'Y' }
})

bitrix.get<boolean>(Method.UPDATE_DEAL, {
  id: 77,
  fields: { TITLE: 'New deal title' }
})
```

**Generics**

* `<P> = unknown` — a payload type. It will be wrapped into the `GetPayload<P>`, so you could get suggestions while accessing the result properties.

**Arguments**

* `method: GettableMethod` — any method that retrieves single entry, like `crm.deal.get`. Be sure to use `Method` enum here.

   The method will disallow to specify any Bitrix method which returns non-list payload. However, if you need to use something new or unsupported, consult Bitrix REST API documentation (ha, a joke!) to figure out does Bitrix method in question returns payload of type `GetPayload<P>`.

* `params?: CreateParams | GetParams | UpdateParams` — params to be passed with an API request.

   Note that for now the client won't check can specified parameters be used with a specified method. Just don't use `GetParams` with create-methods and so on. Type safety FTW.

**Rejects**

* `Error` — a Got error, when an error received as a response

**Returns**

`Promise<GetPayload<P>>`

## `getList`

A generic method for executing any Bitrix method which involves retrieval of the list. Usually, those contain `list` word in the method, like `crm.deal.list`.

On contrary to the `list` method, which _retrieves all entries_, even if they can't be retrieved with a single request, this one _gets only 50 entries per request_.

Note that method can't know which entity will it return, so its type might be provided as a `<P>` generic. Otherwise, it will be of type `unknown`.

```ts
import Bitrix, { Method, Deal } from '@2bad/bitrix'

// ...init client...

bitrix.getList<Deal>(Method.LIST_DEALS, { start: 774 })
```

**Generics**

* `<P> = unknown` — a payload type. It will be wrapped into the `ListPayload<P>`, so you could get suggestions while accessing the result properties.

**Arguments**

* `method: ListableMethod` — any method that retrieves multiple entries, like `crm.deal.list`. Be sure to use `Method` enum here.

   The client will disallow to specify any Bitrix method which returns non-list payload. However, if you need to use something new or unsupported, consult Bitrix REST API documentation to figure out does Bitrix method in question returns payload of type `ListPayload<P>`.

* `params?: ListParams` — params to be passed with an API request, like `start`, `select`, `filter` or `order`.

**Rejects**

* `Error` — a Got error, when an error received as a response
* `Error` — when payload contains `result.error` property.

**Returns**

`Promise<ListPayload<P>>`

## `list`

A compound method for executing any Bitrix method which involves retrieval of the list. Usually, those contain `list` word in the method, like `crm.deal.list`.

Retrieves _all entries_ ("pages") by executing the necessary amount of batch requests with specified Bitrix method.

Note that method can't know which entities will it return, so its type might be provided as a `<P>` generic. Otherwise, it will be of type `unknown`.

```ts
import Bitrix, { Method, Deal } from '@2bad/bitrix'

// ...init client...

bitrix.list<Deal>(Method.LIST_DEALS, { start: 774 })
```

**Generics**

* `<P> = unknown` — a payload type. It will be wrapped into the `ListPayload<P>`, so you could get suggestions while accessing the result properties.

**Arguments**

* `method: ListableMethod` — any method that retrieves multiple entries, like `crm.deal.list`. Be sure to use `Method` enum here.

   The method will disallow to specify any Bitrix method which returns non-list payload. However, if you need to use something new or unsupported, consult Bitrix REST API documentation to figure out does Bitrix method in question returns payload of type `ListPayload<P>`.

* `params?: ListParams` — params to be passed with an API request, like `start`, `select`, `filter` or `order`.

**Rejects**

* `Error` — a Got error, when an error received as a response
* `Error` — when payload contains `result.error` property.

**Returns**

`Promise<ListPayload<P>>`

## `batch`

Executes a series of Bitrix methods within as few as possible requests (using `/batch` Bitrix API endpoint).

If the amount of commands exceeds max allowed by the Bitrix API commands per batch (50 per batch), they will be chunked into standalone request and merged upon completion.

Note that the method can't know which entities will it return. A mapping of commands name to types can be provided as `<CPM>` generic. Otherwise, it will be an object with properties of type `unknown`.

```ts
import Bitrix, { Method, Deal } from '@2bad/bitrix'

// ...init client...

bitrix.batch<{
  deals: readonly Deal[]
  deal: Deal
}>({
 deals: { method. Method.LIST_DEALS },
 deal: { method. Method.GET_DEAL, params: { ID: '77' } }
})
```

**Generics**

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

**Arguments**

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

**Rejects**

* `Error` — a Got error, when an error received as a response
* `Error` — when any payload contains errors in the `result.result_error` property.

**Returns**

`Promise<BatchPayload<CPM>>`