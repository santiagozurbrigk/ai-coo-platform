---
title: "Get Tags"
source: "https://marketplace.gohighlevel.com/docs/ghl/locations/get-location-tags"
seccion: "Sub-Account (Formerly location) > Tags > Get Tags"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/locations/:locationId/tags"
---

# Get Tags

```http
GET /locations/:locationId/tags
```

Get Sub-Account (Formerly Location) Tags

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location Id

### Response (200 · application/json)

Successful response

**Schema**

- **tags** `object[]`

```json
{
  "tags": [
    {
      "name": "minim aliquip anim",
      "locationId": "ve9EPM428h8vShlRW1KT",
      "id": "flGwEuzsfJOia1i1ikRN"
    }
  ]
}
```
