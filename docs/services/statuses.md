
# Statuses service

Work with Bitrix CRM statuses

## Create status - `bitrix.statuses.create()`

Create new status

```ts
bitrix.statuses.create({
  TITLE: 'New status'
})
```

**Arguments**

* `fields: Partial<Status>` — a fields to create status with. See [Status](/source/services/statuses/entities.ts).

**Returns**

`Promise<GetPayload<number>>`

<details>
<summary>See payload example</summary>

```ts
{
  result: 77,
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

## Get status - `bitrix.statuses.get()`

Retrieve specified status

```ts
bitrix.statuses.get('77')
```

**Arguments**

* `id: string` — `ID` of the status to retrieve.

**Returns**

`Promise<GetPayload<Status>>` (See [Status](/source/services/statuses/entities.ts))

<details>
<summary>See payload example</summary>

```ts
// @todo Add
```

</details>

## List statuses - `bitrix.statuses.list()`

Retrieve all statuses.

```ts
bitrix.statuses.list({ select: ['*', 'UF_*'] })
```

**Arguments**

* `params?: ListParams` — params to be passed with an API request

**Returns**

`Promise<ListPayload<Status>>`

<details>
<summary>See payload example</summary>

```ts
// @todo Add
```

</details>

## Update status - `bitrix.statuses.update()`

Update specified status

```ts
bitrix.statuses.update('77', {
  TITLE: 'New status title'
})
```

**Arguments**

* `id: string` — status `ID` to update
* `fields: Partial<Status>` — a fields to update. See [Status](/source/services/statuses/entities.ts)

**Returns**

`Promise<GetPayload<boolean>>`

<details>
<summary>See payload example</summary>

```ts
{
  result: true,
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