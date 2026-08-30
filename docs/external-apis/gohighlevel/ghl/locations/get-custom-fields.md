---
title: "Get Custom Fields"
source: "https://marketplace.gohighlevel.com/docs/ghl/locations/get-custom-fields"
seccion: "Sub-Account (Formerly location) > Custom Field > Get Custom Fields"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/locations/:locationId/customFields"
---

# Get Custom Fields

```http
GET /locations/:locationId/customFields
```

Get Custom Fields

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location Id

### Query parameters

- **model** `string` — Model of the custom field you want to retrieve
  - Available options: `contact`, `opportunity`, `all`

### Response (200 · application/json)

Successful response

**Schema**

- **customFields** `object[]`

```json
{
  "customFields": [
    {
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
  ]
}
```
