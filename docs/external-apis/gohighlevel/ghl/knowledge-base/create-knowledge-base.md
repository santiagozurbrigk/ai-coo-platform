---
title: "Create a new knowledge base (max 15 knowledge bases per location)"
source: "https://marketplace.gohighlevel.com/docs/ghl/knowledge-base/create-knowledge-base"
seccion: "Knowledge Base > Knowledge Base > Create a new knowledge base (max 15 knowledge bases per location)"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/knowledge-bases/"
---

# Create a new knowledge base (max 15 knowledge bases per location)

```http
POST /knowledge-bases/
```

Creates a new knowledge base for a location (maximum 15 per location). WHEN TO USE: use this when you need to add a brand-new knowledge source; use updateKnowledgeBase to rename one; use create (FAQs) or trainDiscoveredUrls to add content. RETURNS: success and the created knowledge base, including its server-assigned id.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **name** `string` _required_ — Name of the knowledge base
- **description** `string` — Optional description of the knowledge base
- **locationId** `string` _required_ — The location ID this knowledge base belongs to

```json
{
  "name": "My Knowledge Base",
  "description": "A knowledge base for customer support FAQs",
  "locationId": "qIyivCmsuEOSnyoFYEej"
}
```

### Response (201 · application/json)

Knowledge base created successfully

**Schema**

- **success** `boolean` _required_ — Success status of the operation
- **data** `object` _required_ — Created knowledge base details

```json
{
  "success": true,
  "data": {}
}
```
