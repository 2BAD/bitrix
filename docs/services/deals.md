# Deals service

A dash in the enum column means this Bitrix endpoint is not represented by a `Method` member in the current package. See [Methods](../methods.md) for the generic `call` escape hatch.

| Bitrix method | Enum method | API |
| :--- | :--- | :--- |
| `crm.deal.add` | `Method.CRM_DEAL_ADD` | [`bitrix.deals.create()`](deals.md#create-deal---bitrixdealscreate) |
| `crm.deal.contact.add` | — |  |
| `crm.deal.contact.delete` | — |  |
| `crm.deal.contact.fields` | — |  |
| `crm.deal.contact.items.delete` | — |  |
| `crm.deal.contact.items.get` | — |  |
| `crm.deal.contact.items.set` | — |  |
| `crm.deal.delete` | — |  |
| `crm.deal.fields` | `Method.CRM_DEAL_FIELDS` |  |
| `crm.deal.get` | `Method.CRM_DEAL_GET` | [`bitrix.deals.get()`](deals.md#get-deal---bitrixdealsget) |
| `crm.deal.list` | `Method.CRM_DEAL_LIST` | [`bitrix.deals.list()`](deals.md#list-deals---bitrixdealslist) |
| `crm.deal.productrows.get` | — |  |
| `crm.deal.productrows.set` | — |  |
| `crm.deal.recurring.add` | — |  |
| `crm.deal.recurring.delete` | — |  |
| `crm.deal.recurring.expose` | — |  |
| `crm.deal.recurring.fields` | — |  |
| `crm.deal.recurring.get` | — |  |
| `crm.deal.recurring.list` | — |  |
| `crm.deal.recurring.update` | — |  |
| `crm.deal.update` | `Method.CRM_DEAL_UPDATE` | [`bitrix.deals.update()`](deals.md#update-deal---bitrixdealsupdate) |
| `crm.deal.userfield.add` | — |  |
| `crm.deal.userfield.delete` | — |  |
| `crm.deal.userfield.get` | — |  |
| `crm.deal.userfield.list` | — |  |
| `crm.deal.userfield.update` | — |  |

## Create deal - `bitrix.deals.create()`

Create new deal

```typescript
bitrix.deals.create({
  TITLE: 'New deal'
}, {
  REGISTER_SONET_EVENT: 'Y'
})
```

**Arguments**

* `fields: Partial<Deal>` — a set of fields to create deal with. See [Deal](https://github.com/2BAD/bitrix/tree/b0db508dcebe77f486f7db833183f28de7de14db/source/services/deals/entities.ts).
* `params?: CreateParams['params']` — a list of parameters to create deal with.

**Returns**

`Promise<GetPayload<number>>` — a `number` stands for... well, nobody knows. Probably `ID` of the created deal?

See payload example \`\`\`ts { result: 77, time: { start: 1567372034.625375, finish: 1567372034.8204, duration: 0.19502496719360352, processing: 0.03838515281677246, date\_start: "2019-09-02T00:07:14+03:00", date\_finish: "2019-09-02T00:07:14+03:00" } } \`\`\`

## Get deal - `bitrix.deals.get()`

Retrieve specified deal

```typescript
bitrix.deals.get('77')
```

**Arguments**

* `id: string` — `ID` of the deal to retrieve.

**Returns**

`Promise<GetPayload<Deal>>` \(See [Deal](https://github.com/2BAD/bitrix/tree/b0db508dcebe77f486f7db833183f28de7de14db/source/services/deals/entities.ts)\)

See payload example \`\`\`ts { result: { ID: '77', TITLE: 'RE: Hello', HONORIFIC: null, NAME: 'hello@example.com', SECOND\_NAME: '', LAST\_NAME: '', COMPANY\_TITLE: '', COMPANY\_ID: '7744', CONTACT\_ID: '47', IS\_RETURN\_CUSTOMER: 'Y', BIRTHDATE: '', SOURCE\_ID: 'EMAIL', SOURCE\_DESCRIPTION: null, STATUS\_ID: 'CONVERTED', STATUS\_DESCRIPTION: null, POST: '', COMMENTS: 'RE: Hello', CURRENCY\_ID: 'USD', OPPORTUNITY: '0.00', HAS\_PHONE: 'N', HAS\_EMAIL: 'Y', HAS\_IMOL: 'N', ASSIGNED\_BY\_ID: '17', CREATED\_BY\_ID: '17', MODIFY\_BY\_ID: '1', DATE\_CREATE: '2018-06-05T09:59:22+03:00', DATE\_MODIFY: '2019-07-22T23:39:46+03:00', DATE\_CLOSED: '2018-07-04T03:20:31+03:00', STATUS\_SEMANTIC\_ID: 'S', OPENED: 'Y', ORIGINATOR\_ID: 'email-tracker', ORIGIN\_ID: '7', ADDRESS: null, ADDRESS\_2: null, ADDRESS\_CITY: null, ADDRESS\_POSTAL\_CODE: null, ADDRESS\_REGION: null, ADDRESS\_PROVINCE: null, ADDRESS\_COUNTRY: null, ADDRESS\_COUNTRY\_CODE: null, UTM\_SOURCE: null, UTM\_MEDIUM: null, UTM\_CAMPAIGN: null, UTM\_CONTENT: null, UTM\_TERM: null, EMAIL: \[ { ID: '774', VALUE\_TYPE: 'WORK', VALUE: 'hello@example.com', TYPE\_ID: 'EMAIL' } \] }, time: { start: 1567372034.625375, finish: 1567372034.8204, duration: 0.19502496719360352, processing: 0.03838515281677246, date\_start: "2019-09-02T00:07:14+03:00", date\_finish: "2019-09-02T00:07:14+03:00" } } \`\`\`

## List deals - `bitrix.deals.list()`

Retrieve all deals.

```typescript
bitrix.deals.list({ select: ['*', 'UF_*'] })
```

**Arguments**

* `params?: ListParams` — params to be passed with an API request

**Returns**

`Promise<ListPayload<Deal>>`

See payload example \`\`\`ts { result: \[{ ID: '77', TITLE: 'RE: Hello', HONORIFIC: null, NAME: 'hello@example.com', SECOND\_NAME: '', LAST\_NAME: '', COMPANY\_TITLE: '', COMPANY\_ID: '7744', CONTACT\_ID: '47', IS\_RETURN\_CUSTOMER: 'Y', BIRTHDATE: '', SOURCE\_ID: 'EMAIL', SOURCE\_DESCRIPTION: null, STATUS\_ID: 'CONVERTED', STATUS\_DESCRIPTION: null, POST: '', COMMENTS: 'RE: Hello', CURRENCY\_ID: 'USD', OPPORTUNITY: '0.00', HAS\_PHONE: 'N', HAS\_EMAIL: 'Y', HAS\_IMOL: 'N', ASSIGNED\_BY\_ID: '17', CREATED\_BY\_ID: '17', MODIFY\_BY\_ID: '1', DATE\_CREATE: '2018-06-05T09:59:22+03:00', DATE\_MODIFY: '2019-07-22T23:39:46+03:00', DATE\_CLOSED: '2018-07-04T03:20:31+03:00', STATUS\_SEMANTIC\_ID: 'S', OPENED: 'Y', ORIGINATOR\_ID: 'email-tracker', ORIGIN\_ID: '7', ADDRESS: null, ADDRESS\_2: null, ADDRESS\_CITY: null, ADDRESS\_POSTAL\_CODE: null, ADDRESS\_REGION: null, ADDRESS\_PROVINCE: null, ADDRESS\_COUNTRY: null, ADDRESS\_COUNTRY\_CODE: null, UTM\_SOURCE: null, UTM\_MEDIUM: null, UTM\_CAMPAIGN: null, UTM\_CONTENT: null, UTM\_TERM: null, EMAIL: \[ { ID: '774', VALUE\_TYPE: 'WORK', VALUE: 'hello@example.com', TYPE\_ID: 'EMAIL' } \] }\], error: 'Possible error', next: 2, time: { start: 1567372034.625375, finish: 1567372034.8204, duration: 0.19502496719360352, processing: 0.03838515281677246, date\_start: "2019-09-02T00:07:14+03:00", date\_finish: "2019-09-02T00:07:14+03:00" }, total: 7 } \`\`\`

## Update deal - `bitrix.deals.update()`

Update specified deal

```typescript
bitrix.deals.update('77', {
  TITLE: 'New deal title'
})
```

**Arguments**

* `id: string` — deal `ID` to update
* `fields: Partial<Deal>` — a fields to update. See [Deal](https://github.com/2BAD/bitrix/tree/b0db508dcebe77f486f7db833183f28de7de14db/source/services/deals/entities.ts).
* `params?: UpdateParams['params']` — a params to update deal with.

**Returns**

`Promise<GetPayload<boolean>>`

See payload example \`\`\`ts { result: true, time: { start: 1567372034.625375, finish: 1567372034.8204, duration: 0.19502496719360352, processing: 0.03838515281677246, date\_start: "2019-09-02T00:07:14+03:00", date\_finish: "2019-09-02T00:07:14+03:00" } } \`\`\`

