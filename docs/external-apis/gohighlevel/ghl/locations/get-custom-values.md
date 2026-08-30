---
title: "Get Custom Values"
source: "https://marketplace.gohighlevel.com/docs/ghl/locations/get-custom-values"
seccion: "Sub-Account (Formerly location) > Custom Value > Get Custom Values"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/locations/:locationId/customValues"
---

# Get Custom Values

```http
GET /locations/:locationId/customValues
```

Get Custom Values

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location Id

### Response (200 · application/json)

Successful response

**Schema**

- **customValues** `object[]`

```json
{
  "customValues": [
    {
      "id": "rWQ709Pb62syqGLceg1x",
      "name": "Custom Field",
      "fieldKey": "{{ custom_values.custom_field }}",
      "value": "Value",
      "locationId": "rWQ709Pb6dasyqGLceg1x"
    }
  ]
}
```
