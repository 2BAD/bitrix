
# Statuses service

| API                                                 | Enum method                      | Bitrix method                                                                                                    |
| :---------------------------------------------------| :------------------------------- | :------------------------------------------------------------------------------------------------------          |
|                                                     | `Method.CRM_STATUS_FIELDS`       | [`crm.status.fields`](https://dev.1c-bitrix.ru/rest_help/crm/auxiliary/status/crm_status_fields.php)             |
|                                                     | `Method.CRM_STATUS_ENTITY_TYPES` | [`crm.status.entity.types`](https://dev.1c-bitrix.ru/rest_help/crm/auxiliary/status/crm_status_entity_types.php) |
|                                                     | `Method.CRM_STATUS_ENTITY_ITEMS` | [`crm.status.entity.items`](https://dev.1c-bitrix.ru/rest_help/crm/auxiliary/status/crm_status_entity_items.php) |
| [`bitrix.statuses.create()`](#bitrixstatusescreate) | `Method.CRM_STATUS_ADD`          | [`crm.status.add`](https://dev.1c-bitrix.ru/rest_help/crm/auxiliary/status/crm_status_add.php)                   |
| [`bitrix.statuses.delete()`](#bitrixstatusesdelete) | `Method.CRM_STATUS_DELETE`       | [`crm.status.delete`](https://dev.1c-bitrix.ru/rest_help/crm/auxiliary/status/crm_status_delete.php)             |
| [`bitrix.statuses.get()`](#bitrixstatusesget)       | `Method.CRM_STATUS_GET`          | [`crm.status.get`](https://dev.1c-bitrix.ru/rest_help/crm/auxiliary/status/crm_status_get.php)                   |
| [`bitrix.statuses.list()`](#bitrixstatuseslist)     | `Method.CRM_STATUS_LIST`         | [`crm.status.list`](https://dev.1c-bitrix.ru/rest_help/crm/auxiliary/status/crm_status_list.php)                 |
| [`bitrix.statuses.update()`](#bitrixstatusesupdate) | `Method.CRM_STATUS_UPDATE`       | [`crm.status.update`](https://dev.1c-bitrix.ru/rest_help/crm/auxiliary/status/crm_status_update.php)             |

## `bitrix.statuses.create()`

Create new status

```ts
bitrix.statuses.create({
  NAME: 'New status'
})
```

**Arguments**

* `fields: Partial<Status>` — a fields to create status with. See [Status](/source/services/statuses/entities.ts).

**Returns**

 * `Promise<GetPayload<number>>`

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

## `bitrix.statuses.get()`

Retrieve specified status

```ts
bitrix.statuses.get('1')
```

**Arguments**

* `id: string` — `ID` of the status to retrieve.

**Returns**

 * `Promise<GetPayload<Status>>` (See [Status](/source/services/statuses/entities.ts))

<details>
<summary>See payload example</summary>

```ts
{
  result: [
    {
      ID: "1",
      ENTITY_ID: "STATUS",
      STATUS_ID: "NEW",
      NAME: "Не обработан",
      NAME_INIT: "Не обработан",
      SORT: "10",
      SYSTEM: "Y",
      EXTRA: {
        SEMANTICS: "process",
        COLOR: "#E1E1E1"
      }
    }
  ],
  total: 1,
  time: {
    start: 1567988070.0949659,
    finish: 1567988070.1293139,
    duration: 0.034348011016845703,
    processing: 0.0028300285339355469,
    date_start: "2019-09-09T03:14:30+03:00",
    date_finish: "2019-09-09T03:14:30+03:00"
  }
}
```

</details>

## `bitrix.statuses.list()`

Retrieve all statuses.

```ts
bitrix.statuses.list({ filter: { ID: '1' }})
```

**Arguments**

* `{ order?, filter? }: { Record<string, any>, Record<string, any>}` — statuses list accepts only optional `order` and `filter` parameters

**Returns**

 * `Promise<ListPayload<Status>>`

<details>
<summary>See payload example</summary>

```ts
{
  result: [
    {
      ID: "1",
      ENTITY_ID: "STATUS",
      STATUS_ID: "NEW",
      NAME: "Не обработан",
      NAME_INIT: "Не обработан",
      SORT: "10",
      SYSTEM: "Y",
      EXTRA: {
        SEMANTICS: "process",
        COLOR: "#E1E1E1"
      }
    }
  ],
  total: 1,
  time: {
    start: 1567988070.0949659,
    finish: 1567988070.1293139,
    duration: 0.034348011016845703,
    processing: 0.0028300285339355469,
    date_start: "2019-09-09T03:14:30+03:00",
    date_finish: "2019-09-09T03:14:30+03:00"
  }
}
```

</details>

## `bitrix.statuses.update()`

Update specified status

```ts
bitrix.statuses.update('77', {
  NAME: 'New status name'
})
```

**Arguments**

* `id: string` — status `ID` to update
* `fields: Partial<Status>` — a fields to update. See [Status](/source/services/statuses/entities.ts)

**Returns**

 * `Promise<GetPayload<boolean>>`

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

## `bitrix.statuses.delete()`

Delete status

```ts
bitrix.statuses.delete('1')
```

**Arguments**

* `id: string` — `ID` of the status to delete.
* `params?.FORCED?: 'Y' | 'N'` — setting FORCED parameter to 'Y' allows you to delete system statuses

**Returns**

 * `Promise<GetPayload<boolean>>`

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
