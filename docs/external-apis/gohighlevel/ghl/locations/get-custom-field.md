---
title: "Get Custom Field"
source: "https://marketplace.gohighlevel.com/docs/ghl/locations/get-custom-field"
seccion: "Sub-Account (Formerly location) > Custom Field > Get Custom Field"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/locations/:locationId/customFields/:id"
---

# Get Custom Field

```http
GET /locations/:locationId/customFields/:id
```

Get Custom Field

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location Id
- **id** `string` _required_ — Custom Field Id or Field Key (e.g. "contact.first_name" or "opportunity.pipeline_id")

### Response (200 · application/json)

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
