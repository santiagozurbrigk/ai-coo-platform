---
title: "Get Custom Fields By Object Key"
source: "https://marketplace.gohighlevel.com/docs/ghl/custom-fields/get-custom-fields-by-object-key"
seccion: "Custom Fields V2 > Custom Fields V2 > Get Custom Fields By Object Key"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/custom-fields/object-key/:objectKey"
---

# Get Custom Fields By Object Key

```http
GET /custom-fields/object-key/:objectKey
```

Get Custom Fields By Object Key

> info
>
> Only supports Custom Objects and Company (Business) today. Will be extended to other Standard Objects in the future.
>

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **objectKey** `string` _required_ — key of the Object. Must include "custom_objects." prefix for custom objects. Available on the Custom Objects details Page under settings

### Query parameters

- **locationId** `string` _required_

### Response (200 · application/json)

Successful response

**Schema**

- **fields** `object[]` — Custom Fields for the object.
- **folders** `object[]` — Custom Fields folder for the object.

```json
{
  "fields": [
    {
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
  ],
  "folders": [
    {
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
  ]
}
```
