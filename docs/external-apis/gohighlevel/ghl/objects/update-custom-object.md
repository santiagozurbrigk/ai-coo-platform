---
title: "Update Object Schema By Key / Id"
source: "https://marketplace.gohighlevel.com/docs/ghl/objects/update-custom-object"
seccion: "Objects > Object Schema > Update Object Schema By Key / Id"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/objects/:key"
---

# Update Object Schema By Key / Id

```http
PUT /objects/:key
```

Update Custom Object Schema or standard object's like contact, opportunity, business searchable fields. To understand objects and records, please have a look at the documentation here : [https://doc.clickup.com/8631005/d/h/87cpx-277156/93bf0c2e23177b0](https://doc.clickup.com/8631005/d/h/87cpx-277156/93bf0c2e23177b0)

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **key** `string` _required_ — key of the custom or standard object. For custom objects, the key must include the prefix “custom_objects.”. This key can be found on the Object Details page under Settings in the UI.

### Request body (application/json)

**Body required**

- **labels** `object` — This is how your custom object will be displayed
- **description** `string` — Pet Object`s description
- **locationId** `string` _required_ — location id
- **searchableProperties** `string[]` _required_ — Searchable Fields: Provide the field key of your object that you want to search on, using the format (custom_object.<object_name>.<field_key>).

```json
{
  "labels": {
    "singular": "Pet",
    "plural": "Pets"
  },
  "description": "These are non vaccinated pets",
  "locationId": "632c34b4c9b7da3358ac9891",
  "searchableProperties": [
    "custom_objects.mad.mad",
    "custom_objects.mad.record_1",
    "custom_objects.mad.nn"
  ]
}
```

### Response (200 · application/json)

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
