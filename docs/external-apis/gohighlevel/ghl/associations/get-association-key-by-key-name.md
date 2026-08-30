---
title: "Get association key by key name"
source: "https://marketplace.gohighlevel.com/docs/ghl/associations/get-association-key-by-key-name"
seccion: "Associations > Associations > Get association key by key name"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/associations/key/:key_name"
---

# Get association key by key name

```http
GET /associations/key/:key_name
```

Using this api you can get standard / user defined association by key

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **key_name** `string` _required_

### Query parameters

- **locationId** `string` _required_

### Response (200 · application/json)

Successful response

**Schema**

- **locationId** `string` _required_
- **id** `string` _required_
- **key** `string` _required_ — First Objects Association Label (custom_objects.children)
- **firstObjectLabel** `object` _required_ — First Objects Association Label (custom_objects.children)
- **firstObjectKey** `object` _required_ — First Objects Key
- **secondObjectLabel** `object` _required_ — Second Object Association Label (contact)
- **secondObjectKey** `object` _required_ — Second Objects Key
- **associationType** `object` _required_ — Association Type can be USER_DEFINED or SYSTEM_DEFINED

```json
{
  "locationId": "string",
  "id": "ve9EPM428h8vShlRW1KT",
  "key": "student",
  "firstObjectLabel": "student",
  "firstObjectKey": "custom_objects.children",
  "secondObjectLabel": "Teacher",
  "secondObjectKey": "contact",
  "associationType": "USER_DEFINED"
}
```
