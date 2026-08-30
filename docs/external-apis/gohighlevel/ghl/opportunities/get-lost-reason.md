---
title: "Get lost reason"
source: "https://marketplace.gohighlevel.com/docs/ghl/opportunities/get-lost-reason"
seccion: "Opportunities > Lost reason > Get lost reason"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/opportunities/lost-reason"
---

# Get lost reason

```http
GET /opportunities/lost-reason
```

Get lost reason

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Identifier of the location (sub-account)
- **name** `string` — lost reason name
- **deleted** `boolean` — deleted

  Default value:

  `false`

- **query** `string` — search query
- **skip** `number` — skip

  Default value:

  `0`

- **limit** `number` — limit

  Default value:

  `100`

- **getCount** `boolean` — get count

### Response (200 · application/json)

Successful response

**Schema**

- **lostReasons** `object[]` — List of lost reasons for the location
- **total** `number` — Total number of lost reasons matching the query

```json
{
  "lostReasons": [],
  "total": 100
}
```
