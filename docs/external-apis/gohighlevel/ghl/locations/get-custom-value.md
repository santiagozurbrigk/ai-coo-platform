---
title: "Get Custom Value"
source: "https://marketplace.gohighlevel.com/docs/ghl/locations/get-custom-value"
seccion: "Sub-Account (Formerly location) > Custom Value > Get Custom Value"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/locations/:locationId/customValues/:id"
---

# Get Custom Value

```http
GET /locations/:locationId/customValues/:id
```

Get Custom Value

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location Id
- **id** `string` _required_ — Custom Value Id

### Response (200 · application/json)

Successful response

**Schema**

- **customValue** `object`

```json
{
  "customValue": {
    "id": "rWQ709Pb62syqGLceg1x",
    "name": "Custom Field",
    "fieldKey": "{{ custom_values.custom_field }}",
    "value": "Value",
    "locationId": "rWQ709Pb6dasyqGLceg1x"
  }
}
```
