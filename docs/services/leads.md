
# Leads service

| Bitrix method               | Enum method                        | API                                                                                |
| :-------------------------- | :--------------------------------- | :--------------------------------------------------------------------------------- |
| `crm.lead.add`              | `Method.CRM_LEAD_ADD`              | [`bitrix.leads.create()`](#create-lead---bitrixleadscreate)                        |
| `crm.lead.delete`           | `Method.CRM_LEAD_DELETE`           |                                                                                    |
| `crm.lead.fields`           | `Method.CRM_LEAD_FIELDS`           |                                                                                    |
| `crm.lead.get`              | `Method.CRM_LEAD_GET`              | [`bitrix.leads.get()`](#get-lead---bitrixleadsget)                                 |
| `crm.lead.list`             | `Method.CRM_LEAD_LIST`             | [`bitrix.leads.list()`](#list-leads---bitrixleadslist)                             |
| `crm.lead.productrows.get`  | `Method.CRM_LEAD.PRODUCTROWS_GET`  |                                                                                    |
| `crm.lead.productrows.set`  | `Method.CRM_LEAD.PRODUCTROWS_SET`  |                                                                                    |
| `crm.lead.update`           | `Method.CRM_LEAD_UPDATE`           | [`bitrix.leads.update()`](#update-lead---bitrixleadsupdate)                        |
| `crm.lead.userfield.add`    | `Method.CRM_LEAD_USERFIELD_ADD`    |                                                                                    |
| `crm.lead.userfield.delete` | `Method.CRM_LEAD_USERFIELD_DELETE` |                                                                                    |
| `crm.lead.userfield.get`    | `Method.CRM_LEAD_USERFIELD_GET`    |                                                                                    |
| `crm.lead.userfield.list`   | `Method.CRM_LEAD_USERFIELD_LIST`   |                                                                                    |
| `crm.lead.userfield.update` | `Method.CRM_LEAD_USERFIELD_UPDATE` |                                                                                    |

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

* `fields: Partial<Lead>` — a fields to create lead with. See [Lead](/source/services/leads/entities.ts).
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

`Promise<GetPayload<Lead>>` (See [Lead](/source/services/leads/entities.ts))

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
* `fields: Partial<Lead>` — a fields to update. See [Lead](/source/services/leads/entities.ts).
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