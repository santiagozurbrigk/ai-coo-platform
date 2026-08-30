---
title: "Get Custom Field / Folder By Id"
source: "https://marketplace.gohighlevel.com/docs/ghl/custom-fields/get-custom-field-by-id"
seccion: "Custom Fields V2 > Custom Fields V2 > Get Custom Field / Folder By Id"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/custom-fields/:id"
---

# Get Custom Field / Folder By Id

```http
GET /custom-fields/:id
```

Get Custom Field / Folder By Id.

> info
>
> Only supports Custom Objects and Company (Business) today. Will be extended to other Standard Objects in the future.
>

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **id** `string` _required_

### Response (200 · application/json)

Successful response

**Schema**

- **field** `object`

```json
{
  "field": {
    "locationId": "ve9EPM428h8vShlRW1KT",
    "name": "Name",
    "description": "string",
    "placeholder": "string",
    "showInForms": true,
    "options": [
      {
        "key": "string",
        "label": "string",
        "url": "string"
      }
    ],
    "acceptedFormats": ".pdf",
    "id": "string",
    "objectKey": "custom_object.pet",
    "dataType": "TEXT",
    "parentId": "3v34PM428h8vShlRW1KT",
    "fieldKey": "custom_object.pet.name",
    "allowCustomOption": true,
    "maxFileLimit": 2,
    "dateAdded": "2024-07-29T15:51:28.071Z",
    "dateUpdated": "2024-07-29T15:51:28.071Z"
  }
}
```
