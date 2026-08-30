---
title: "Update Association By Id"
source: "https://marketplace.gohighlevel.com/docs/ghl/associations/update-association"
seccion: "Associations > Associations > Update Association By Id"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/associations/:associationId"
---

# Update Association By Id

```http
PUT /associations/:associationId
```

Update Association , Allows you to update labels of an associations. Documentation Link - [https://doc.clickup.com/8631005/d/h/87cpx-293776/cd0f4122abc04d3](https://doc.clickup.com/8631005/d/h/87cpx-293776/cd0f4122abc04d3)

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **associationId** `string` _required_

### Request body (application/json)

**Body required**

- **firstObjectLabel** `object` _required_
- **secondObjectLabel** `object` _required_

```json
{
  "firstObjectLabel": "student",
  "secondObjectLabel": "tutor"
}
```

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
