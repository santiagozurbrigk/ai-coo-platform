---
title: "Create Custom Object"
source: "https://marketplace.gohighlevel.com/docs/ghl/objects/create-custom-object-schema"
seccion: "Objects > Object Schema > Create Custom Object"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/objects/"
---

# Create Custom Object

```http
POST /objects/
```

Allows you to create a custom object schema. To understand objects and records, please have a look at the documentation here : [https://doc.clickup.com/8631005/d/h/87cpx-277156/93bf0c2e23177b0](https://doc.clickup.com/8631005/d/h/87cpx-277156/93bf0c2e23177b0)

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **labels** `object` _required_ — This is what your custom object will be called. These labels will be used to display your custom object on the UI
- **key** `string` _required_ — key that would be used to refer the Custom Object internally (lowercase + underscore_separated). 'custom_objects.' would be added as prefix by default
- **description** `string` — Pet Object`s description
- **locationId** `string` _required_ — Location Id
- **primaryDisplayPropertyDetails** `object` _required_ — Primary property which will be displayed on the record page

```json
{
  "labels": {
    "singular": "Pet",
    "plural": "Pets"
  },
  "key": "custom_objects.pet",
  "description": "These are non vaccinated pets",
  "locationId": "ve9EPM428h8vShlRW1KT",
  "primaryDisplayPropertyDetails": {
    "key": "custom_objects.pet.name",
    "name": "Pet name",
    "dataType": "TEXT"
  }
}
```

### Response (201 · application/json)

Successful response

**Schema**

- **object** `object`

```json
{
  "object": {
    "id": "661c06b4ffde146bdb469442",
    "standard": false,
    "key": "custom_objects.pet",
    "labels": {
      "singular": "Pet",
      "plural": "Pets"
    },
    "description": "These are non vaccinated pets",
    "locationId": "Q9DT3OAqEXDLYuob1G32",
    "primaryDisplayProperty": "custom_objects.pet.name",
    "dateAdded": "2024-07-29T15:51:28.071Z",
    "dateUpdated": "2024-07-29T15:51:28.071Z",
    "type": "The Object type can either USER_DEFINED or SYSTEM_DEFINED"
  }
}
```
