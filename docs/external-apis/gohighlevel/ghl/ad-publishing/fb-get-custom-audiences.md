---
title: "Get custom audiences"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-get-custom-audiences"
seccion: "Ad Manager > Facebook Ads > Get custom audiences"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/ad-publishing/facebook/custom-audience"
---

# Get custom audiences

```http
GET /ad-publishing/facebook/custom-audience
```

Retrieve Facebook custom audiences for a location. Without `limit` the response is a plain array. When `limit` is provided (max 100) the response is a paginated `{ customAudiences, paging }` envelope; pass `after` (from `paging.next`) to fetch the next batch. By default each item is returned in full; pass `projection` (comma-separated, dot-notation for nested fields, e.g. ?projection=id,name,dataSource.type) to return only the requested fields — any value outside the known field set is rejected.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location identifier
- **type** `string` _required_ — Audience list type
  - Available options: `lookalike`, `custom`, `all`
- **source** `string` — Audience data source
  - Available options: `ad_manager`, `integration`
- **adAccountId** `string` _required_ — Ad account identifier
- **limit** `string` — Page size for a paginated fetch (max 100). When set, the response is a { customAudiences, paging } envelope instead of a plain array.
- **after** `string` — Opaque cursor for the next batch, taken from the previous response paging.next
- **projection** `string[]` — Fields to return on each item, comma-separated (e.g. ?projection=id,name,dataSource.type). When set, only the requested fields are returned. Nested fields use dot-notation; naming a parent (e.g. dataSource) returns the whole nested object. Any value outside the known field set is rejected. Omit the param entirely to receive the full item as-is.
  - Available options: `id`, `name`, `description`, `approximateCountLowerBound`, `approximateCountUpperBound`, `subtype`, `timeCreated`, `timeUpdated`, `dataSource`, `dataSource.type`, `dataSource.subType`, `dataSource.creationParams`

### Response (200 · application/json)

A plain array of custom audiences (default), or a { customAudiences, paging } envelope when `limit` is provided. Lookalike and custom audiences share one shape — `subtype` distinguishes them. Supplying `projection` narrows every entry to the requested fields only.

**Schema**

oneOf

Array [

- **id** `string` — Audience id
- **name** `string` — Audience name
- **description** `string` — Audience description. Empty string when not set.
- **subtype** `string` — How the audience was built. `LOOKALIKE` for lookalikes; `CUSTOM`, `ENGAGEMENT`, `WEBSITE`, and `LEAD` for the rest.
- **approximateCountLowerBound** `number` — Lower bound of the audience size. Facebook floors small audiences — `1000` and `20` are placeholders, not counts.
- **approximateCountUpperBound** `number` — Upper bound of the audience size
- **deliveryStatus** `object` — Whether the audience can be used in a campaign right now
- **operationStatus** `object` — Whether Facebook is still building or refreshing the audience
- **dataSource** `object` — Where the audience gets its members from
- **timeCreated** `number` — Creation time as a Unix timestamp in seconds, not milliseconds and not ISO-8601.
- **timeUpdated** `number` — Last update time as a Unix timestamp in seconds. Equals `timeCreated` when never edited.

]

```json
[
  {
    "id": "120250373909070122",
    "name": "Website Visitors - Last 30 Days",
    "description": "",
    "subtype": "ENGAGEMENT",
    "approximateCountLowerBound": 19900000,
    "approximateCountUpperBound": 23400000,
    "deliveryStatus": {
      "code": 200,
      "description": "This audience is ready for use."
    },
    "operationStatus": {
      "code": 200,
      "description": "This audience is ready for use."
    },
    "dataSource": {
      "type": "EVENT_BASED",
      "subType": "WEB_PIXEL_HITS",
      "creationParams": "[]"
    },
    "timeCreated": 1787123977,
    "timeUpdated": 1787123977
  }
]
```
