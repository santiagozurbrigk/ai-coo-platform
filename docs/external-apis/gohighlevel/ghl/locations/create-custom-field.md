---
title: "Create Custom Field"
source: "https://marketplace.gohighlevel.com/docs/ghl/locations/create-custom-field"
seccion: "Sub-Account (Formerly location) > Custom Field > Create Custom Field"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/locations/:locationId/customFields"
---

# Create Custom Field

```http
POST /locations/:locationId/customFields
```

Create Custom Field

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location Id

### Request body (application/json)

**Body required**

- **name** `string` _required_
- **dataType** `string` _required_
- **placeholder** `string`
- **acceptedFormat** `string[]`
- **isMultipleFile** `boolean`
- **maxNumberOfFiles** `number`
- **textBoxListOptions** `object[]`
- **position** `number`

  **Default value:**

  `0`

- **model** `string` — Model of the custom field you want to create
  - Available options: `contact`, `opportunity`

```json
{
  "name": "Custom Field",
  "dataType": "TEXT",
  "placeholder": "Placeholder Text",
  "acceptedFormat": [
    ".pdf",
    ".docx",
    ".jpeg"
  ],
  "isMultipleFile": false,
  "maxNumberOfFiles": 2,
  "textBoxListOptions": [
    {
      "label": "First",
      "prefillValue": ""
    },
    {
      "label": "First",
      "prefillValue": ""
    }
  ],
  "position": 0,
  "model": "opportunity"
}
```

### Response (201 · application/json)

Successful response

**Schema**

- **customField** `object`

```json
{
  "customField": {
    "id": "3sv6UEo51C9Bmpo1cKTq",
    "name": "pincode",
    "fieldKey": "contact.pincode",
    "placeholder": "Pin code",
    "dataType": "TEXT",
    "position": 0,
    "picklistOptions": [
      "first option"
    ],
    "picklistImageOptions": [],
    "isAllowedCustomOption": false,
    "isMultiFileAllowed": true,
    "maxFileLimit": 4,
    "locationId": "3sv6UEo51C9Bmpo1cKTq",
    "model": "opportunity"
  }
}
```
