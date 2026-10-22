# Errors

```ts
import { BitrixError } from '@2bad/bitrix'

try {
  await bitrix.deals.get(1)
} catch (error) {
  if (error instanceof BitrixError) console.log(error.code, error.description, error.status) // HTTP_400 Not found 400
}
```

Every failure is a `BitrixError` with:

- `code`: the Bitrix error code like `ACCESS_DENIED` or `ERROR_METHOD_NOT_FOUND`, or `HTTP_<status>` when Bitrix sends none
- `description`: the Bitrix message
- `method`: the REST method
- `status`: the HTTP status, when there was a response
- `command`: the key of the failed command in a `batch`

A response that is not JSON gives `INVALID_RESPONSE`. Network errors are rethrown as they are after the last retry.

## Retries

```ts
const bitrix = createClient({
  url,
  retry: {
    // optional, values are the defaults
    retries: 3, // attempts after the first one
    delay: 1000 // backoff in ms, doubled on every attempt
  }
})
```

Retried:

- `QUERY_LIMIT_EXCEEDED`: right away, after the rate limiter empties its bucket
- `OPERATION_TIME_LIMIT`: once the method limit resets, using `operating_reset_at` of earlier responses, with backoff when it is unknown
- HTTP 5xx and network errors: with backoff
- `expired_token`: once after `onAuthExpired`, see [Connecting](connecting.md#oauth-application)

Retries of server and network errors can repeat a write Bitrix already applied before the error, for example create a deal twice. Rate limit errors are safe, Bitrix rejects those requests before running them. Use `retry: { retries: 0 }` on a client for writes that must not repeat.

## Cancellation

```ts
const controller = new AbortController()
setTimeout(() => controller.abort(), 5000)

await bitrix.list('crm.deal.list', {}, { signal: controller.signal })
```

`call`, `list`, `paginate` and `batch` take a `signal`, and `createClient` takes one for every call. An aborted call rejects with the abort reason and stops retrying.
