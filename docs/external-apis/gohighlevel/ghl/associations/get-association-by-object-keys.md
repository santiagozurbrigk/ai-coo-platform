---
title: "Get association by object keys"
source: "https://marketplace.gohighlevel.com/docs/ghl/associations/get-association-by-object-keys"
seccion: "Associations > Associations > Get association by object keys"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/associations/objectKey/:objectKey"
---

# Get association by object keys

```http
GET /associations/objectKey/:objectKey
```

Get association by object keys like contacts, custom objects and opportunities. Documentation Link - [https://doc.clickup.com/8631005/d/h/87cpx-293776/cd0f4122abc04d3](https://doc.clickup.com/8631005/d/h/87cpx-293776/cd0f4122abc04d3)

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **objectKey** `string`

### Query parameters

- **locationId** `string`

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
