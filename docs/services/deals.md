
# Deals service

| Bitrix method                   | Enum method                            | API                                                                                |
| :------------------------------ | :------------------------------------- | :--------------------------------------------------------------------------------- |
| `crm.deal.add`                  | `Method.CRM_DEAL_ADD`                  | [`bitrix.deals.create()`](/docs/services/deals.md#create-deal---bitrixdealscreate) |
| `crm.deal.contact.add`          | `Method.CRM_DEAL_CONTACT_ADD`          |                                                                                    |
| `crm.deal.contact.delete`       | `Method.CRM_DEAL_CONTACT_DELETE`       |                                                                                    |
| `crm.deal.contact.fields`       | `Method.CRM_DEAL_CONTACT_FIELDS`       |                                                                                    |
| `crm.deal.contact.items.delete` | `Method.CRM_DEAL_CONTACT_ITEMS_DELETE` |                                                                                    |
| `crm.deal.contact.items.get`    | `Method.CRM_DEAL_CONTACT_ITEMS_GET`    |                                                                                    |
| `crm.deal.contact.items.set`    | `Method.CRM_DEAL_CONTACT_ITEMS_SET`    |                                                                                    |
| `crm.deal.delete`               | `Method.CRM_DEAL_DELETE`               |                                                                                    |
| `crm.deal.fields`               | `Method.CRM_DEAL_FIELDS`               |                                                                                    |
| `crm.deal.get`                  | `Method.CRM_DEAL_GET`                  | [`bitrix.deals.get()`](/docs/services/deals.md#get-deal---bitrixdealsget)          |
| `crm.deal.list`                 | `Method.CRM_DEAL_LIST`                 | [`bitrix.deals.list()`](/docs/services/deals.md#list-deals---bitrixdealslist)      |
| `crm.deal.productrows.get`      | `Method.CRM_DEAL_PRODUCTROWS_GET`      |                                                                                    |
| `crm.deal.productrows.set`      | `Method.CRM_DEAL_PRODUCTROWS_SET`      |                                                                                    |
| `crm.deal.recurring.add`        | `Method.CRM_DEAL_RECURRING_ADD`        |                                                                                    |
| `crm.deal.recurring.delete`     | `Method.CRM_DEAL_RECURRING_DELETE`     |                                                                                    |
| `crm.deal.recurring.expose`     | `Method.CRM_DEAL_RECURRING_EXPOSE`     |                                                                                    |
| `crm.deal.recurring.fields`     | `Method.CRM_DEAL_RECURRING_FIELDS`     |                                                                                    |
| `crm.deal.recurring.get`        | `Method.CRM_DEAL_RECURRING_GET`        |                                                                                    |
| `crm.deal.recurring.list`       | `Method.CRM_DEAL_RECURRING_LIST`       |                                                                                    |
| `crm.deal.recurring.update`     | `Method.CRM_DEAL_RECURRING_UPDATE`     |                                                                                    |
| `crm.deal.update`               | `Method.CRM_DEAL_UPDATE`               | [`bitrix.deals.update()`](/docs/services/deals.md#update-deal---bitrixdealsupdate) |
| `crm.deal.userfield.add`        | `Method.CRM_DEAL_USERFIELD_ADD`        |                                                                                    |
| `crm.deal.userfield.delete`     | `Method.CRM_DEAL_USERFIELD_DELETE`     |                                                                                    |
| `crm.deal.userfield.get`        | `Method.CRM_DEAL_USERFIELD_GET`        |                                                                                    |
| `crm.deal.userfield.list`       | `Method.CRM_DEAL_USERFIELD_LIST`       |                                                                                    |
| `crm.deal.userfield.update`     | `Method.CRM_DEAL_USERFIELD_UPDATE`     |                                                                                    |

## Create deal - `bitrix.deals.create()`

Create new deal

```ts
bitrix.deals.create({
  TITLE: 'New deal'
}, {
  REGISTER_SONET_EVENT: 'Y'
})
```

**Arguments**

* `fields: Partial<Deal>` — a set of fields to create deal with. See [Deal](/source/services/deals/entities.ts).
* `params?: CreateParams['params']` — a list of parameters to create deal with.

**Returns**

`Promise<GetPayload<number>>` — a `number` stands for... well, nobody knows. Probably `ID` of the created deal?

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

## Get deal - `bitrix.deals.get()`

Retrieve specified deal

```ts
bitrix.deals.get('77')
```

**Arguments**

* `id: string` — `ID` of the deal to retrieve.

**Returns**

`Promise<GetPayload<Deal>>` (See [Deal](/source/services/deals/entities.ts))

<details>
<summary>See payload example</summary>

```ts
{
  result: {
    ID: '77',
    TITLE: 'RE: Hello',
    HONORIFIC: null,
    NAME: 'hello@example.com',
    SECOND_NAME: '',
    LAST_NAME: '',
    COMPANY_TITLE: '',
    COMPANY_ID: '7744',
    CONTACT_ID: '47',
    IS_RETURN_CUSTOMER: 'Y',
    BIRTHDATE: '',
    SOURCE_ID: 'EMAIL',
    SOURCE_DESCRIPTION: null,
    STATUS_ID: 'CONVERTED',
    STATUS_DESCRIPTION: null,
    POST: '',
    COMMENTS: 'RE: Hello',
    CURRENCY_ID: 'USD',
    OPPORTUNITY: '0.00',
    HAS_PHONE: 'N',
    HAS_EMAIL: 'Y',
    HAS_IMOL: 'N',
    ASSIGNED_BY_ID: '17',
    CREATED_BY_ID: '17',
    MODIFY_BY_ID: '1',
    DATE_CREATE: '2018-06-05T09:59:22+03:00',
    DATE_MODIFY: '2019-07-22T23:39:46+03:00',
    DATE_CLOSED: '2018-07-04T03:20:31+03:00',
    STATUS_SEMANTIC_ID: 'S',
    OPENED: 'Y',
    ORIGINATOR_ID: 'email-tracker',
    ORIGIN_ID: '7',
    ADDRESS: null,
    ADDRESS_2: null,
    ADDRESS_CITY: null,
    ADDRESS_POSTAL_CODE: null,
    ADDRESS_REGION: null,
    ADDRESS_PROVINCE: null,
    ADDRESS_COUNTRY: null,
    ADDRESS_COUNTRY_CODE: null,
    UTM_SOURCE: null,
    UTM_MEDIUM: null,
    UTM_CAMPAIGN: null,
    UTM_CONTENT: null,
    UTM_TERM: null,
    EMAIL: [
      { ID: '774', VALUE_TYPE: 'WORK', VALUE: 'hello@example.com', TYPE_ID: 'EMAIL' }
    ]
  },
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

## List deals - `bitrix.deals.list()`

Retrieve all deals.

```ts
bitrix.deals.list({ select: ['*', 'UF_*'] })
```

**Arguments**

* `params?: ListParams` — params to be passed with an API request

**Returns**

`Promise<ListPayload<Deal>>`

<details>
<summary>See payload example</summary>

```ts
{
  result: [{
    ID: '77',
    TITLE: 'RE: Hello',
    HONORIFIC: null,
    NAME: 'hello@example.com',
    SECOND_NAME: '',
    LAST_NAME: '',
    COMPANY_TITLE: '',
    COMPANY_ID: '7744',
    CONTACT_ID: '47',
    IS_RETURN_CUSTOMER: 'Y',
    BIRTHDATE: '',
    SOURCE_ID: 'EMAIL',
    SOURCE_DESCRIPTION: null,
    STATUS_ID: 'CONVERTED',
    STATUS_DESCRIPTION: null,
    POST: '',
    COMMENTS: 'RE: Hello',
    CURRENCY_ID: 'USD',
    OPPORTUNITY: '0.00',
    HAS_PHONE: 'N',
    HAS_EMAIL: 'Y',
    HAS_IMOL: 'N',
    ASSIGNED_BY_ID: '17',
    CREATED_BY_ID: '17',
    MODIFY_BY_ID: '1',
    DATE_CREATE: '2018-06-05T09:59:22+03:00',
    DATE_MODIFY: '2019-07-22T23:39:46+03:00',
    DATE_CLOSED: '2018-07-04T03:20:31+03:00',
    STATUS_SEMANTIC_ID: 'S',
    OPENED: 'Y',
    ORIGINATOR_ID: 'email-tracker',
    ORIGIN_ID: '7',
    ADDRESS: null,
    ADDRESS_2: null,
    ADDRESS_CITY: null,
    ADDRESS_POSTAL_CODE: null,
    ADDRESS_REGION: null,
    ADDRESS_PROVINCE: null,
    ADDRESS_COUNTRY: null,
    ADDRESS_COUNTRY_CODE: null,
    UTM_SOURCE: null,
    UTM_MEDIUM: null,
    UTM_CAMPAIGN: null,
    UTM_CONTENT: null,
    UTM_TERM: null,
    EMAIL: [
      { ID: '774', VALUE_TYPE: 'WORK', VALUE: 'hello@example.com', TYPE_ID: 'EMAIL' }
    ]
  }],
  error: 'Possible error',
  next: 2,
  time: {
    start: 1567372034.625375,
    finish: 1567372034.8204,
    duration: 0.19502496719360352,
    processing: 0.03838515281677246,
    date_start: "2019-09-02T00:07:14+03:00",
    date_finish: "2019-09-02T00:07:14+03:00"
  },
  total: 7
}
```

</details>

## Update deal - `bitrix.deals.update()`

Update specified deal

```ts
bitrix.deals.update('77', {
  TITLE: 'New deal title'
})
```

**Arguments**

* `id: string` — deal `ID` to update
* `fields: Partial<Deal>` — a fields to update. See [Deal](/source/services/deals/entities.ts).
* `params?: UpdateParams['params']` — a params to update deal with.

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
