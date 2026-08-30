---
title: "Get Pipelines"
source: "https://marketplace.gohighlevel.com/docs/ghl/opportunities/get-pipelines"
seccion: "Opportunities > Pipelines > Get Pipelines"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/opportunities/pipelines"
---

# Get Pipelines

```http
GET /opportunities/pipelines
```

Get Pipelines

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Identifier of the location (sub-account) to retrieve pipelines for

### Response (200 · application/json)

Successful response

**Schema**

- **pipelines** `object[]` — List of pipelines for the location

```json
{
  "pipelines": []
}
```
