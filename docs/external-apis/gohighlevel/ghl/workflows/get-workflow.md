---
title: "Get Workflow"
source: "https://marketplace.gohighlevel.com/docs/ghl/workflows/get-workflow"
seccion: "Workflows > Workflows > Get Workflow"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/workflows/"
---

# Get Workflow

```http
GET /workflows/
```

Get Workflow

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_

### Response (200 · application/json)

Successful response

**Schema**

- **workflows** `object[]`

```json
{
  "workflows": [
    {
      "id": "78559bb3-b920-461e-b010-7b2a2816d2a9",
      "name": "First Workflow",
      "status": "draft",
      "version": 2,
      "createdAt": "2021-05-26T11:33:49.000Z",
      "updatedAt": "2021-05-26T11:33:49.000Z",
      "locationId": "eBG6WapS3v4ZqwA45MTxtYJ"
    }
  ]
}
```
