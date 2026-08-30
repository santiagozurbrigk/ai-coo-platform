---
title: "Get Forms"
source: "https://marketplace.gohighlevel.com/docs/ghl/forms/get-forms"
seccion: "Forms > Forms > Get Forms"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/forms/"
---

# Get Forms

```http
GET /forms/
```

Get Forms

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_
- **skip** `number`
- **limit** `number` — Limit Per Page records count. will allow maximum up to 50 and default will be 10

  Default value:

  `10`

- **type** `string`

### Response (200 · application/json)

Successful response

**Schema**

- **forms** `object[]`
- **total** `number` — Total number of forms

```json
{
  "forms": [
    {
      "id": "YSWdvS4Is98wtIDGnpmI",
      "name": "Form 1",
      "locationId": "ve9EPM428h8vShlRW1KT"
    }
  ],
  "total": "20"
}
```
