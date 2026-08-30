---
title: "Get Snapshots"
source: "https://marketplace.gohighlevel.com/docs/ghl/snapshots/get-custom-snapshots"
seccion: "Snapshots > Snapshots > Get Snapshots"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/snapshots/"
---

# Get Snapshots

```http
GET /snapshots/
```

Get a list of all own and imported Snapshots

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **companyId** `string` _required_ — Company Id

### Response (200 · application/json)

Successful response

**Schema**

- **snapshots** `object[]`

```json
{
  "snapshots": [
    {
      "id": "1eM2UgkfaECOYyUdCo9Pa",
      "name": "Martial Arts Snapshot",
      "type": "own"
    }
  ]
}
```
