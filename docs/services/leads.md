
# Leads service

Work with Bitrix CRM leads

## Create lead - `bitrix.leads.create()`

Create new lead

```ts
bitrix.leads.create({
  TITLE: 'New lead'
}, {
  REGISTER_SONET_EVENT: 'Y'
})
```

**Arguments**

* `fields: Partial<Lead>` — a fields to create lead with. See [Lead](/2BAD/bitrix/blob/master/source/services/types/lead.ts).
* `params?: CreateParams['params']` — a params to create lead with.

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

## Get lead - `bitrix.leads.get()`

Retrieve specified lead

```ts
bitrix.leads.get('77')
```

**Arguments**

* `id: string` — `ID` of the lead to retrieve.

**Returns**

`Promise<GetPayload<Lead>>` (See [Lead](/2BAD/bitrix/blob/master/source/services/types/lead.ts))

<details>
<summary>See payload example</summary>

```ts
// @todo Add
```

</details>

## List leads - `bitrix.leads.list()`

Retrieve all leads.

```ts
bitrix.leads.list({ select: ['*', 'UF_*'] })
```

**Arguments**

* `params?: ListParams` — params to be passed with an API request

**Returns**

`Promise<ListPayload<Lead>>`

<details>
<summary>See payload example</summary>

```ts
// @todo Add
```

</details>

## Update lead - `bitrix.leads.update()`

Update specified lead

```ts
bitrix.leads.update('77', {
  TITLE: 'New lead title'
})
```

**Arguments**

* `id: string` — lead `ID` to update
* `fields: Partial<Lead>` — a fields to update. See [Lead](/2BAD/bitrix/blob/master/source/services/types/lead.ts).
* `params?: UpdateParams['params']` — a params to update lead with.

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