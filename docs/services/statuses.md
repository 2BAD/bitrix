# Statuses service

| API | Enum method | Bitrix method |
| :--- | :--- | :--- |
| [`bitrix.statuses.fields()`](statuses.md#bitrixstatusesfields) | `Method.CRM_STATUS_FIELDS` | [`crm.status.fields`](https://dev.1c-bitrix.ru/rest_help/crm/auxiliary/status/crm_status_fields.php) |
|  | `Method.CRM_STATUS_ENTITY_TYPES` | [`crm.status.entity.types`](https://dev.1c-bitrix.ru/rest_help/crm/auxiliary/status/crm_status_entity_types.php) |
|  | `Method.CRM_STATUS_ENTITY_ITEMS` | [`crm.status.entity.items`](https://dev.1c-bitrix.ru/rest_help/crm/auxiliary/status/crm_status_entity_items.php) |
| [`bitrix.statuses.create()`](statuses.md#bitrixstatusescreate) | `Method.CRM_STATUS_ADD` | [`crm.status.add`](https://dev.1c-bitrix.ru/rest_help/crm/auxiliary/status/crm_status_add.php) |
| [`bitrix.statuses.delete()`](statuses.md#bitrixstatusesdelete) | `Method.CRM_STATUS_DELETE` | [`crm.status.delete`](https://dev.1c-bitrix.ru/rest_help/crm/auxiliary/status/crm_status_delete.php) |
| [`bitrix.statuses.get()`](statuses.md#bitrixstatusesget) | `Method.CRM_STATUS_GET` | [`crm.status.get`](https://dev.1c-bitrix.ru/rest_help/crm/auxiliary/status/crm_status_get.php) |
| [`bitrix.statuses.list()`](statuses.md#bitrixstatuseslist) | `Method.CRM_STATUS_LIST` | [`crm.status.list`](https://dev.1c-bitrix.ru/rest_help/crm/auxiliary/status/crm_status_list.php) |
| [`bitrix.statuses.update()`](statuses.md#bitrixstatusesupdate) | `Method.CRM_STATUS_UPDATE` | [`crm.status.update`](https://dev.1c-bitrix.ru/rest_help/crm/auxiliary/status/crm_status_update.php) |

## `bitrix.statuses.fields()`

List all fields for [Status](https://github.com/2BAD/bitrix/tree/b0db508dcebe77f486f7db833183f28de7de14db/source/services/statuses/entities.ts) entity

```typescript
bitrix.statuses.fields()
```

**Returns**

* `Promise<GetPayload<Fields>>`

See payload example \`\`\`ts { result: { ID: { type: "integer", isRequired: false, isReadOnly: true, isImmutable: false, isMultiple: false, isDynamic: false, title: "ID" }, ENTITY\_ID: { type: "string", isRequired: true, isReadOnly: false, isImmutable: true, isMultiple: false, isDynamic: false, title: "ID элемента сущности" }, STATUS\_ID: { type: "string", isRequired: true, isReadOnly: false, isImmutable: true, isMultiple: false, isDynamic: false, title: "Статус" }, SORT: { type: "integer", isRequired: false, isReadOnly: false, isImmutable: false, isMultiple: false, isDynamic: false, title: "Сортировка" }, NAME: { type: "string", isRequired: true, isReadOnly: false, isImmutable: false, isMultiple: false, isDynamic: false, title: "Название" }, NAME\_INIT: { type: "string", isRequired: false, isReadOnly: true, isImmutable: false, isMultiple: false, isDynamic: false, title: "Название по умолчанию" }, SYSTEM: { type: "char", isRequired: false, isReadOnly: true, isImmutable: false, isMultiple: false, isDynamic: false, title: "Системный" }, EXTRA: { type: "crm\_status\_extra", isRequired: false, isReadOnly: false, isImmutable: false, isMultiple: false, isDynamic: false, title: "Дополнительные поля" } }, time: { start: 1568749081.1406679, finish: 1568749081.1696601, duration: 0.028992176055908203, processing: 0.0014741420745849609, date\_start: "2019-09-17T22:38:01+03:00", date\_finish: "2019-09-17T22:38:01+03:00" } } \`\`\`

## `bitrix.statuses.create()`

Create new status

```typescript
bitrix.statuses.create({
  NAME: 'New status'
})
```

**Arguments**

* `fields: Partial<Status>` — a fields to create status with. See [Status](https://github.com/2BAD/bitrix/tree/b0db508dcebe77f486f7db833183f28de7de14db/source/services/statuses/entities.ts).

**Returns**

* `Promise<GetPayload<number>>`

See payload example \`\`\`ts { result: 77, time: { start: 1567372034.625375, finish: 1567372034.8204, duration: 0.19502496719360352, processing: 0.03838515281677246, date\_start: "2019-09-02T00:07:14+03:00", date\_finish: "2019-09-02T00:07:14+03:00" } } \`\`\`

## `bitrix.statuses.delete()`

Delete status

```typescript
bitrix.statuses.delete('1')
```

**Arguments**

* `id: string` — `ID` of the status to delete.
* `params?.FORCED?: 'Y' | 'N'` — setting FORCED parameter to 'Y' allows you to delete system statuses

**Returns**

* `Promise<GetPayload<boolean>>`

See payload example \`\`\`ts { result: true, time: { start: 1567372034.625375, finish: 1567372034.8204, duration: 0.19502496719360352, processing: 0.03838515281677246, date\_start: "2019-09-02T00:07:14+03:00", date\_finish: "2019-09-02T00:07:14+03:00" } } \`\`\`

## `bitrix.statuses.get()`

Retrieve specified status

```typescript
bitrix.statuses.get('1')
```

**Arguments**

* `id: string` — `ID` of the status to retrieve.

**Returns**

* `Promise<GetPayload<Status>>` \(See [Status](https://github.com/2BAD/bitrix/tree/b0db508dcebe77f486f7db833183f28de7de14db/source/services/statuses/entities.ts)\)

See payload example \`\`\`ts { result: \[ { ID: "1", ENTITY\_ID: "STATUS", STATUS\_ID: "NEW", NAME: "Не обработан", NAME\_INIT: "Не обработан", SORT: "10", SYSTEM: "Y", EXTRA: { SEMANTICS: "process", COLOR: "\#E1E1E1" } } \], total: 1, time: { start: 1567988070.0949659, finish: 1567988070.1293139, duration: 0.034348011016845703, processing: 0.0028300285339355469, date\_start: "2019-09-09T03:14:30+03:00", date\_finish: "2019-09-09T03:14:30+03:00" } } \`\`\`

## `bitrix.statuses.list()`

Retrieve all statuses.

```typescript
bitrix.statuses.list({ filter: { ID: '1' }})
```

**Arguments**

* `{ order?, filter? }: { Record<string, any>, Record<string, any>}` — statuses list accepts only optional `order` and `filter` parameters

**Returns**

* `Promise<ListPayload<Status>>`

See payload example \`\`\`ts { result: \[ { ID: "1", ENTITY\_ID: "STATUS", STATUS\_ID: "NEW", NAME: "Не обработан", NAME\_INIT: "Не обработан", SORT: "10", SYSTEM: "Y", EXTRA: { SEMANTICS: "process", COLOR: "\#E1E1E1" } } \], total: 1, time: { start: 1567988070.0949659, finish: 1567988070.1293139, duration: 0.034348011016845703, processing: 0.0028300285339355469, date\_start: "2019-09-09T03:14:30+03:00", date\_finish: "2019-09-09T03:14:30+03:00" } } \`\`\`

## `bitrix.statuses.update()`

Update specified status

```typescript
bitrix.statuses.update('77', {
  NAME: 'New status name'
})
```

**Arguments**

* `id: string` — status `ID` to update
* `fields: Partial<Status>` — a fields to update. See [Status](https://github.com/2BAD/bitrix/tree/b0db508dcebe77f486f7db833183f28de7de14db/source/services/statuses/entities.ts)

**Returns**

* `Promise<GetPayload<boolean>>`

See payload example \`\`\`ts { result: true, time: { start: 1567372034.625375, finish: 1567372034.8204, duration: 0.19502496719360352, processing: 0.03838515281677246, date\_start: "2019-09-02T00:07:14+03:00", date\_finish: "2019-09-02T00:07:14+03:00" } } \`\`\`

