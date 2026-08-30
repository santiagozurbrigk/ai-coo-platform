---
title: "Delete trained pages"
source: "https://marketplace.gohighlevel.com/docs/ghl/knowledge-base/delete-trained-urls-for-knowledge-base"
seccion: "Knowledge Base > Web Crawler > Delete trained pages"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/knowledge-bases/crawler"
---

# Delete trained pages

```http
DELETE /knowledge-bases/crawler
```

Removes trained website pages from a knowledge base so the AI no longer references them. WHEN TO USE: use this when you need to drop specific or all trained URLs; use trainDiscoveredUrls to add pages; use getAllWebsiteUrlsDataByKnowledgeBase to list what is trained. RETURNS: whether the delete succeeded.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **locationId** `string` _required_ — Location ID as string
- **knowledgeBaseId** `string` — Knowledge base ID as string (optional)
- **urlIds** `string[]` _required_ — List of URL ids
- **deleteAll** `boolean` _required_ — delete all flag
- **excludeUrlIds** `string[]` — URL IDs to exclude from a deleteAll operation (select-all-minus-some flow)
- **search** `string` — Substring filter (case-insensitive) matched against `url` or `title` to scope deleteAll to filtered rows only. Mirrors the search semantics of the list endpoint.

```json
{
  "locationId": "qIyivCmsuEOSnyoFYEej",
  "knowledgeBaseId": "I1rITlYLJofFosIqC4Np",
  "urlIds": [
    "689268c7a64d801ef7bb44aa"
  ],
  "deleteAll": false,
  "excludeUrlIds": [
    "689268c7a64d801ef7bb44aa"
  ],
  "search": "blog"
}
```

### Response (200 · application/json)

Selected pages deleted successfully

**Schema**

- **success** `boolean` _required_ — Indicates if the operation was successful
- **deletedCount** `number` _required_ — Number of URLs deleted
- **message** `string` _required_ — Success message

```json
{
  "success": true,
  "deletedCount": 2,
  "message": "URLs deleted successfully"
}
```
