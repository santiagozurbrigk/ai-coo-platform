---
title: "Get tag by id"
source: "https://marketplace.gohighlevel.com/docs/ghl/locations/get-tag-by-id"
seccion: "Sub-Account (Formerly location) > Tags > Get tag by id"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/locations/:locationId/tags/:tagId"
---

# Get tag by id

```http
GET /locations/:locationId/tags/:tagId
```

Get tag by id

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location Id
- **tagId** `string` _required_ — Tag Id

### Response (200 · application/json)

Successful response

**Schema**

- **tag** `object`

```json
{
  "tag": {
    "name": "minim aliquip anim",
    "locationId": "ve9EPM428h8vShlRW1KT",
    "id": "flGwEuzsfJOia1i1ikRN"
  }
}
```
