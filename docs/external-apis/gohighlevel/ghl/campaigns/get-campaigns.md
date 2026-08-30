---
title: "Get Campaigns"
source: "https://marketplace.gohighlevel.com/docs/ghl/campaigns/get-campaigns"
seccion: "Campaigns > Campaigns > Get Campaigns"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/campaigns/"
---

# Get Campaigns

```http
GET /campaigns/
```

Get Campaigns

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_
- **status** `string`

### Response (200 · application/json)

Successful response

**Schema**

- **campaigns** `object[]`

```json
{
  "campaigns": [
    {
      "id": "mIVALPYuTD7YjUHnFEx4",
      "name": "test",
      "status": "published",
      "locationId": "ve9EPM428h8vShlRW1KT"
    }
  ]
}
```
