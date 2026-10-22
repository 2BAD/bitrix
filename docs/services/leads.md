# Leads service

A dash in the enum column means this Bitrix endpoint is not represented by a `Method` member in the current package. See [Methods](../methods.md) for the generic `call` escape hatch.

| Bitrix method | Enum method | API |
| :--- | :--- | :--- |
| `crm.lead.add` | `Method.CRM_LEAD_ADD` | [`bitrix.leads.create()`](leads.md#create-lead---bitrixleadscreate) |
| `crm.lead.delete` | — |  |
| `crm.lead.fields` | `Method.CRM_LEAD_FIELDS` |  |
| `crm.lead.get` | `Method.CRM_LEAD_GET` | [`bitrix.leads.get()`](leads.md#get-lead---bitrixleadsget) |
| `crm.lead.list` | `Method.CRM_LEAD_LIST` | [`bitrix.leads.list()`](leads.md#list-leads---bitrixleadslist) |
| `crm.lead.productrows.get` | — |  |
| `crm.lead.productrows.set` | — |  |
| `crm.lead.update` | `Method.CRM_LEAD_UPDATE` | [`bitrix.leads.update()`](leads.md#update-lead---bitrixleadsupdate) |
| `crm.lead.userfield.add` | — |  |
| `crm.lead.userfield.delete` | — |  |
| `crm.lead.userfield.get` | — |  |
| `crm.lead.userfield.list` | — |  |
| `crm.lead.userfield.update` | — |  |

## Create lead - `bitrix.leads.create()`

Create new lead

```typescript
bitrix.leads.create({
  TITLE: 'New lead'
}, {
  REGISTER_SONET_EVENT: 'Y'
})
```

**Arguments**

* `fields: Partial<Lead>` — a fields to create lead with. See [Lead](https://github.com/2BAD/bitrix/tree/b0db508dcebe77f486f7db833183f28de7de14db/source/services/leads/entities.ts).
* `params?: CreateParams['params']` — a params to create lead with.

**Returns**

`Promise<GetPayload<number>>`

See payload example \`\`\`ts { result: 77, time: { start: 1567372034.625375, finish: 1567372034.8204, duration: 0.19502496719360352, processing: 0.03838515281677246, date\_start: "2019-09-02T00:07:14+03:00", date\_finish: "2019-09-02T00:07:14+03:00" } } \`\`\`

## Get lead - `bitrix.leads.get()`

Retrieve specified lead

```typescript
bitrix.leads.get('77')
```

**Arguments**

* `id: string` — `ID` of the lead to retrieve.

**Returns**

`Promise<GetPayload<Lead>>` \(See [Lead](https://github.com/2BAD/bitrix/tree/b0db508dcebe77f486f7db833183f28de7de14db/source/services/leads/entities.ts)\)

See payload example \`\`\`ts // @todo Add \`\`\`

## List leads - `bitrix.leads.list()`

Retrieve all leads.

```typescript
bitrix.leads.list({ select: ['*', 'UF_*'] })
```

**Arguments**

* `params?: ListParams` — params to be passed with an API request

**Returns**

`Promise<ListPayload<Lead>>`

See payload example \`\`\`ts // @todo Add \`\`\`

## Update lead - `bitrix.leads.update()`

Update specified lead

```typescript
bitrix.leads.update('77', {
  TITLE: 'New lead title'
})
```

**Arguments**

* `id: string` — lead `ID` to update
* `fields: Partial<Lead>` — a fields to update. See [Lead](https://github.com/2BAD/bitrix/tree/b0db508dcebe77f486f7db833183f28de7de14db/source/services/leads/entities.ts).
* `params?: UpdateParams['params']` — a params to update lead with.

**Returns**

`Promise<GetPayload<boolean>>`

See payload example \`\`\`ts { result: true, time: { start: 1567372034.625375, finish: 1567372034.8204, duration: 0.19502496719360352, processing: 0.03838515281677246, date\_start: "2019-09-02T00:07:14+03:00", date\_finish: "2019-09-02T00:07:14+03:00" } } \`\`\`

