---
title: "Get Last Snapshot Push"
source: "https://marketplace.gohighlevel.com/docs/ghl/snapshots/get-latest-snapshot-push"
seccion: "Snapshots > Snapshots > Get Last Snapshot Push"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/snapshots/snapshot-status/:snapshotId/location/:locationId"
---

# Get Last Snapshot Push

```http
GET /snapshots/snapshot-status/:snapshotId/location/:locationId
```

Get Latest Snapshot Push Status for a location id

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **snapshotId** `string` _required_
- **locationId** `string` _required_

### Query parameters

- **companyId** `string` _required_

### Response (200 · application/json)

Successful response

**Schema**

- **data** `object`

```json
{
  "data": {
    "id": "1eM2UgkfaECOYyUdCo9Pa",
    "locationId": "BrKClvyvdxhJ9Mxz2pzQ",
    "status": "processing",
    "completed": "['forms', 'surveys', 'funnels', 'workflows']",
    "pending": "['custom_fields','custom_values','tags']"
  }
}
```
