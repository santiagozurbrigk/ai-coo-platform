---
title: "Create Relation for you associated entities."
source: "https://marketplace.gohighlevel.com/docs/ghl/associations/create-relation"
seccion: "Associations > Relations > Create Relation for you associated entities."
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/associations/relations"
---

# Create Relation for you associated entities.

```http
POST /associations/relations
```

Create Relation.Documentation Link - [https://doc.clickup.com/8631005/d/h/87cpx-293776/cd0f4122abc04d3](https://doc.clickup.com/8631005/d/h/87cpx-293776/cd0f4122abc04d3)

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **locationId** `string` _required_ — Your Sub Account's ID
- **associationId** `string` _required_ — Association's Id
- **firstRecordId** `string` _required_ — First Record's Id. For instance, if you have an association between a contact and a custom object, and you specify the contact as the first object while creating the association, then your firstRecordId would be the contactId
- **secondRecordId** `string` _required_ — Second Record's Id.For instance, if you have an association between a contact and a custom object, and you specify the custom object as the second entity while creating the association, then your secondRecordId would be the customObject record Id

```json
{
  "locationId": "clF1LD04GTUKN3b3XuOj",
  "associationId": "ve9EPM428h8vShlRW1KT",
  "firstRecordId": "ve9EPM428h8vShlRW1KT",
  "secondRecordId": "ve9EPM428h8vShlRW1KT"
}
```

### Response (201 · application/json)

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
