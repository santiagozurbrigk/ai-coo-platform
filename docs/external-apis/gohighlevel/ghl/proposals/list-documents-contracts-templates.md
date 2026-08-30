---
title: "List templates"
source: "https://marketplace.gohighlevel.com/docs/ghl/proposals/list-documents-contracts-templates"
seccion: "Proposals > Templates > List templates"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/proposals/templates"
---

# List templates

```http
GET /proposals/templates
```

List document contract templates for a location

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location Id
- **dateFrom** `string` — Date start from (ISO 8601)
- **dateTo** `string` — Date to (ISO 8601)
- **type** `string` — Comma-separated template types. Valid values: proposal, estimate, contentLibrary
- **name** `string` — Template Name
- **isPublicDocument** `boolean` — If the docForm is a DocForm
- **userId** `string` — User Id, required when isPublicDocument is true
- **limit** `string` — Limit
- **skip** `string` — Skip

### Response (200 · application/json)

Templates fetched successfully

**Schema**

- **data** `object[]` _required_ — Array of templates
- **total** `number` _required_ — Total number of templates
- **traceId** `string` — Trace ID for request tracking

```json
{
  "data": [
    {
      "_id": "685d11c371c22e636e9c04b2",
      "deleted": false,
      "version": 2,
      "name": "New Template",
      "locationId": "5rORm9p7RtxWQPzBIbTG",
      "type": "proposal",
      "updatedBy": "K9PSPnWjfNoE8DCf5LJZ",
      "isPublicDocument": true,
      "createdAt": "2025-06-26T09:24:19.305Z",
      "updatedAt": "2025-06-26T09:27:32.119Z",
      "id": "685d11c371c22e636e9c04b2",
      "documentCount": 0,
      "docFormUrl": "https://staging.sendlink.co/documents/doc-form/685d11c371c22e636e9c04b2?locale=en_US"
    }
  ],
  "total": 2,
  "traceId": "d5656876-86a5-46fb-84df-788f1da7937a"
}
```
