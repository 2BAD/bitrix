# Connecting

```ts
import { createClient } from '@2bad/bitrix'

const bitrix = createClient({
  url: 'https://portal.bitrix24.com/rest/1/WEBHOOK_TOKEN', // inbound webhook, or the /rest endpoint for OAuth

  // optional, values are the defaults
  limiter: { burst: 50, refillPerSecond: 2 }, // the Bitrix cloud request limit
  retry: { retries: 3, delay: 1000 }, // attempts after the first one, base backoff in ms

  // optional, off by default
  auth: () => tokens.accessToken, // OAuth access token, a string or a function
  onAuthExpired: refreshTokens, // called once on expired_token, then the request is repeated
  fetch, // your own fetch
  signal, // aborts every call of this client
  onRequest: (event) => {}, // before every HTTP request
  onResponse: (event) => {} // after every HTTP request
})
```

The url is checked when the client is created, an invalid one throws right away.

## Inbound webhook

Create a webhook in the portal with the scopes you need and pass its URL. The token is part of the URL.

```ts
const bitrix = createClient({ url: 'https://portal.bitrix24.com/rest/1/WEBHOOK_TOKEN' })
```

## OAuth application

Pass the REST endpoint, a function that returns the current access token and a callback that refreshes it. Access tokens expire after an hour. When Bitrix answers with `expired_token` the client calls `onAuthExpired` once, shared by all calls waiting on it, then repeats the request.

```ts
let tokens = await loadTokens()

const bitrix = createClient({
  url: 'https://portal.bitrix24.com/rest',
  auth: () => tokens.accessToken,
  onAuthExpired: async () => {
    tokens = await refreshTokens(tokens.refreshToken)
  }
})
```

Getting and refreshing tokens is up to you, see the [Bitrix OAuth docs](https://apidocs.bitrix24.com/api-reference/oauth/index.html).

## Rate limits

Requests are queued to stay inside the Bitrix limit: a burst of 50, then 2 per second. Enterprise plans allow more.

```ts
const bitrix = createClient({ url, limiter: { burst: 250, refillPerSecond: 5 } })
```

## Logging and metrics

`onRequest` runs right before every HTTP request and `onResponse` after it, retries included. The events carry the method, its params without the auth token, the attempt number, the duration in ms, the Bitrix `time` block and the error of a failed attempt.

```ts
const bitrix = createClient({
  url,
  onResponse: ({ method, attempt, duration, time, error }) =>
    console.log(
      JSON.stringify({ method, attempt, duration, operating: time?.operating, error: error && String(error) })
    )
})
```

A hook that throws fails the call.

## Custom fetch

```ts
import { Agent, fetch } from 'undici'

const dispatcher = new Agent({ connect: { rejectUnauthorized: false } })
const bitrix = createClient({ url, fetch: (input, init) => fetch(input, { ...init, dispatcher }) })
```

Use it for a proxy, custom TLS settings or a runtime without a global `fetch`.
