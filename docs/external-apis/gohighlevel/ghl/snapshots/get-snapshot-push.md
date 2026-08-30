---
title: "Get Snapshot Push between Dates"
source: "https://marketplace.gohighlevel.com/docs/ghl/snapshots/get-snapshot-push"
seccion: "Snapshots > Snapshots > Get Snapshot Push between Dates"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/snapshots/snapshot-status/:snapshotId"
---

# Get Snapshot Push between Dates

```http
GET /snapshots/snapshot-status/:snapshotId
```

Get list of sub-accounts snapshot pushed in time period

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **snapshotId** `string` _required_

### Query parameters

- **companyId** `string` _required_
- **from** `string` _required_ — Only accepts ISO 8601 format
- **to** `string` _required_ — Only accepts ISO 8601 format
- **lastDoc** `string` _required_ — Id for last document till what you want to skip
- **limit** `string` — Limit of documents to return. Default is 20

### Response (200 · application/json)

Successful response

**Schema**

- **data** `object[]`

```json
{
  "data": [
    {
      "id": "1eM2UgkfaECOYyUdCo9Pa",
      "locationId": "BrKClvyvdxhJ9Mxz2pzQ",
      "status": "processing",
      "dateAdded": "10/28/2022, 6:24:54 PM"
    }
  ]
}
```
