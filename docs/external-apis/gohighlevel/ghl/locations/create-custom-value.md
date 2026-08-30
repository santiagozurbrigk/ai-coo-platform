---
title: "Create Custom Value"
source: "https://marketplace.gohighlevel.com/docs/ghl/locations/create-custom-value"
seccion: "Sub-Account (Formerly location) > Custom Value > Create Custom Value"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/locations/:locationId/customValues"
---

# Create Custom Value

```http
POST /locations/:locationId/customValues
```

Create Custom Value

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location Id

### Request body (application/json)

**Body required**

- **name** `string` _required_
- **value** `string` _required_

```json
{
  "name": "Custom Field Name",
  "value": "Value"
}
```

### Response (201 · application/json)

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
