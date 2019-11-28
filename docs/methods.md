# Methods

Those are bare-bones methods which are responsible for taking care of the routine, error handling and types casting.

They are used by the services internally and provided as a part of the public API for very specific use cases.

Usually, _you do not want to use those directly_.

Though, you might find useful a `batch` method which makes a series of Bitrix REST operation with only a few requests.

## `call`

A generic method for executing any supported Bitrix method.

Payload type will be resolved based on the `Methods` map.

```typescript
import Bitrix, { Method } from '@2bad/bitrix'

// ...init client...

bitrix.call(Method.GET_DEAL, { ID: '77' }) // returns GetPayload<Deal>

bitrix.call(Method.CREATE_DEAL, {
  fields: { TITLE: 'New deal' },
  params: { REGISTER_SONET_EVENT: 'Y' }
}) // returns GetPayload<number>

bitrix.call(Method.UPDATE_DEAL, {
  id: 77,
  fields: { TITLE: 'New deal title' }
}) // returns GetPayload<boolean>

bitrix.call(Method.LIST_DEALS, {}) // returns ListPayload<Deal>
bitrix.getList<Deal>(Method.LIST_DEALS, { start: 774 }) // returns ListPayload<Deal>
```

In rare cases you might want to invoke not yet supported by this library method. Use casting and `any` as an escape hatch:

```typescript
bitrix.call('some.new.method' as any, { newParam: true } as any)
  .then((payload) => payload as GetPayload<NewPayload>)
```

**Arguments**

* `method: Method` — any Bitrix method. Be sure to use `Method` enum here.
* `params: MethodParams<M>` — params to be passed with an API request.

**Rejects**

* `Error` — a Got error, when an error received as a response
* `Error` — when payload contains `result.error` property.
* `Error` — when payload contains `result.result.result_error` property.

**Returns**

`Promise<MethodPayload<M>>` — a resolved payload type.

## `list`

A compound method for executing any Bitrix method which involves retrieval of the list. Usually, those contain `list` word in the method, like `crm.deal.list`.

Retrieves _all entries_ \("pages"\) by executing the necessary amount of batch requests with specified Bitrix method.

Payload type will be resolved based on the `Methods` map.

```typescript
import Bitrix, { Method, Deal } from '@2bad/bitrix'

// ...init client...

bitrix.list(Method.LIST_DEALS, { start: 774 })
```

**Arguments**

* `method: ListableMethod` — any method that retrieves multiple entries, like `crm.deal.list`. Be sure to use `Method` enum here.

  The method will disallow to specify any Bitrix method which returns non-list payload. However, if you need to use something new or unsupported, consult Bitrix REST API documentation to figure out does Bitrix method in question returns payload of type `ListPayload<P>`.

* `params: MethodParams<M>` — params to be passed with an API request, like `start`, `select`, `filter` or `order`.

**Rejects**

* `Error` — a Got error, when an error received as a response
* `Error` — when payload contains `result.error` property.

**Returns**

`Promise<ListPayload<P>>`

## `batch`

Executes a series of Bitrix methods within as few as possible requests \(using `/batch` Bitrix API endpoint\).

If the amount of commands exceeds max allowed by the Bitrix API commands per batch \(50 per batch\), they will be chunked into standalone request and merged upon completion.

Payload type will be resolved based on the `Methods` map.

```typescript
import Bitrix, { Method, Deal } from '@2bad/bitrix'

// ...init client...

// With an `const` of named commands
bitrix.batch({
 deals: { method. Method.LIST_DEALS, params: {} },
 deal: { method. Method.GET_DEAL, params: { ID: '77' } }
} as const) // returns { deals: ListPayload<Deal>, deal: Deal }

// With an `const` of array of commands
bitrix.batch([
 { method. Method.LIST_DEALS, params: {} },
 { method. Method.GET_DEAL, params: { ID: '77' } }
 ] as const) // returns [ListPayload<Deal>, Deal]

// With an array of commands
 bitrix.batch([
 { method. Method.LIST_DEALS, params: {} },
 { method. Method.GET_DEAL, params: { ID: '77' } }
 ]) // ReadonlyArray<ListPayload<Deal> | Deal>
```

**Arguments**

* `commands: Commands` — an array of commands to execute, or an object of commands, like so:

  ```typescript
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

  It is highly advised to use commands with `as const`, as it will provide more accurate payload type.

* `commandsPerRequest: number = MAX_COMMANDS_PER_BATCH` — how much commands to cramp into the single request. Usually, it shouldn't be changed. The default value is `50`, a max allowed by the Bitrix API.

**Rejects**

* `Error` — a Got error, when an error received as a response
* `Error` — when any payload contains errors in the `result.result_error` property.

**Returns**

`Promise<BatchPayload<P>>`

