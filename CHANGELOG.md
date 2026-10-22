# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Highlights

- **New client:** rewritten with zero runtime dependencies on top of `fetch`. See
  [Migrating from 2.x](examples/migrating.md).
- **Typed custom fields:** the `bitrix-types` command generates `UF_*` field types from your portal.

### Added

- Added `createClient` with `url`, `auth`, `fetch`, `signal`, `limiter` and `retry` options
- Added OAuth token refresh with the `onAuthExpired` option
- Added `onRequest` and `onResponse` hooks for logging and metrics
- Added `BitrixError` with `code`, `description`, `method`, `status` and `command`
- Added the `activities`, `currencies` and `products` services
- Added `deals.productRows` and `leads.productRows` to read and replace product rows
- Added the `items` service for smart processes and other `crm.item.*` types
- Added `contacts` links to deals, leads and companies, and `companies` links to contacts
- Added `delete` to the deals, leads, contacts and companies services
- Added `createMany`, `updateMany` and `deleteMany` bulk writes to CRM services
- Added `changedSince` to CRM services to read entities changed after a point in time
- Added `paginate` to iterate over list rows as they arrive
- Added the `cursor`, `offset` and `modified` modes to `list` and `paginate`
- Added the `onProgress` option to `list` and `paginate`
- Added the `raw` option to `call` to get the whole response with `time`, `total` and `next`
- Added the `bitrix-types` command to generate types for your portal's user fields
- `list` rows are now typed by the fields passed in `select`
- `call`, `list`, `paginate` and `batch` can now be cancelled with an `AbortSignal`

### Changed

- Node.js 26 or later is now required
- Methods now resolve with the `result` instead of the whole response
- `list` now resolves with an array of rows instead of the list response
- `list` now pages by id by default and rejects other `order` values; use `{ mode: 'offset' }` to keep them
- `batch` now resolves with `{ results, errors }` instead of rejecting when a command fails
- `users.get(id)` now resolves with a single user instead of an array
- `statuses.delete` now takes `{ forced: true }` instead of `{ FORCED: 'Y' }`
- `UF_*` fields are now typed as `unknown` instead of `string`
- Requests failing with `OPERATION_TIME_LIMIT`, HTTP 5xx or network errors are now retried
- Long list reads now send up to 50 pages per batch request
- Method names are now passed as strings like `'crm.deal.get'` instead of `Method` constants

### Removed

- Removed the default export; use `createClient` instead
- Removed `got` options; pass a custom `fetch` instead
- Removed `users.get()` without an id; use `users.list()` instead

## [3.0.0-beta.0] - 2024-07-18

### Changed

- The package is now ESM only

### Removed

- Removed CommonJS support

### Fixed

- Fixed requests failing with 401 when using an OAuth access token ([#55](https://github.com/2BAD/bitrix/issues/55))

[Unreleased]: https://github.com/2BAD/bitrix/compare/v3.0.0-beta.0...HEAD
[3.0.0-beta.0]: https://github.com/2BAD/bitrix/compare/v2.5.1...v3.0.0-beta.0
