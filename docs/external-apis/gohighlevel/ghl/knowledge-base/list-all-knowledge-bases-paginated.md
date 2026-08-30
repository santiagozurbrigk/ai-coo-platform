---
title: "Get all knowledge bases for a location by location Id (paginated)"
source: "https://marketplace.gohighlevel.com/docs/ghl/knowledge-base/list-all-knowledge-bases-paginated"
seccion: "Knowledge Base > Knowledge Base > Get all knowledge bases for a location by location Id (paginated)"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/knowledge-bases/"
---

# Get all knowledge bases for a location by location Id (paginated)

```http
GET /knowledge-bases/
```

Lists knowledge bases for a sub-account (location), with optional name search and cursor pagination. WHEN TO USE: use this when you need to see which knowledge bases exist; use getKnowledgeBaseById for one; use createKnowledgeBase to add one. RETURNS: a page of knowledge bases, activeCount, hasMore, and lastKnowledgeBaseId for the next page.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — The location ID to retrieve knowledge bases for
- **query** `string` — search query for knowledge base name
- **limit** `number` — Maximum number of knowledge bases to return

  Default value:

  `20`

- **lastKnowledgeBaseId** `string` — ID of the last knowledge base from the previous page (for pagination)

### Response (200 · application/json)

Paginated knowledge bases retrieved successfully

**Schema**

- **success** `boolean` _required_ — Success status of the operation
- **data** `object` _required_ — Paginated knowledge bases data

```json
{
  "success": true,
  "data": {}
}
```
