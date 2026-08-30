---
title: "Get Surveys"
source: "https://marketplace.gohighlevel.com/docs/ghl/surveys/get-surveys"
seccion: "Surveys > Surveys > Get Surveys"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/surveys/"
---

# Get Surveys

```http
GET /surveys/
```

Get Surveys

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

- **surveys** `object[]`
- **total** `number` — Number of surveys

```json
{
  "surveys": [
    {
      "id": "I5GFa3d3cKjojpe4VVUx",
      "name": "Survey 1",
      "locationId": "ve9EPM428h8vShlRW1KT"
    }
  ],
  "total": 20
}
```
