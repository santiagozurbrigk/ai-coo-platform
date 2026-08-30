---
title: "Create Tag"
source: "https://marketplace.gohighlevel.com/docs/ghl/locations/create-tag"
seccion: "Sub-Account (Formerly location) > Tags > Create Tag"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/locations/:locationId/tags"
---

# Create Tag

```http
POST /locations/:locationId/tags
```

Create tag

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location Id

### Request body (application/json)

**Body required**

- **name** `string` _required_ — Tag name

```json
{
  "name": "Tag"
}
```

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
