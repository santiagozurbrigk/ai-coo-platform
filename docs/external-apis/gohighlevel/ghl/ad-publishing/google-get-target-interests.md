---
title: "Get target interests"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-get-target-interests"
seccion: "Ad Manager > Google Ads > Get target interests"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/ad-publishing/google/target-interests"
---

# Get target interests

```http
GET /ad-publishing/google/target-interests
```

Retrieve affinity and in-market audience options for Google Ads targeting. Without `limit` the response is a plain array of root interests (each with a nested children tree). When `limit` is provided (max 100) the response is a paginated `{ targetInterests, paging }` envelope — a page counts root interests; pass `pageToken` (from `paging.next`) to fetch the next batch. By default each node is returned in full; pass `projection` (comma-separated, e.g. ?projection=name,userInterestId,children) to return only the requested fields — selecting `children` prunes the whole tree recursively with the same selection, and any value outside the known field set is rejected.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location identifier
- **type** `string` _required_ — Interest type
  - Available options: `AFFINITY`, `IN_MARKET`
- **advertisingChannelType** `string` _required_ — Channel type
- **limit** `string` — Page size for a paginated fetch (max 100). When set, the response is a { targetInterests, paging } envelope instead of a plain array. Counts root interests — each root includes its full children tree.
- **pageToken** `string` — Opaque cursor for the next batch, taken from the previous response paging.next
- **projection** `string[]` — Fields to return on each interest node, comma-separated (e.g. ?projection=name,userInterestId,children). When set, only the requested fields are returned. Selecting `children` prunes the whole tree recursively with the same selection; `availabilities` returns the whole array. Any value outside the known field set is rejected. Omit the param entirely to receive the full node as-is.
  - Available options: `resourceName`, `taxonomyType`, `userInterestId`, `name`, `userInterestParent`, `availabilities`, `children`

### Response (200 · application/json)

A plain array of root interests (default), or a { targetInterests, paging } envelope when `limit` is provided

**Schema**

oneOf

Array [

- **property name*** `any`

]

```json
[
  {
    "resourceName": "customers/6776452901/userInterests/80546",
    "userInterestId": "80546",
    "name": "Sports & Fitness",
    "taxonomyType": "AFFINITY",
    "children": [
      {
        "resourceName": "customers/6776452901/userInterests/92948",
        "userInterestId": "92948",
        "name": "Fitness Buffs",
        "taxonomyType": "AFFINITY",
        "userInterestParent": "customers/6776452901/userInterests/80546",
        "children": []
      }
    ]
  }
]
```
