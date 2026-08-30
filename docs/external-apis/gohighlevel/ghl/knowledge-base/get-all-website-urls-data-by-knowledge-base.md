---
title: "Get all trained page links by knowledge base"
source: "https://marketplace.gohighlevel.com/docs/ghl/knowledge-base/get-all-website-urls-data-by-knowledge-base"
seccion: "Knowledge Base > Web Crawler > Get all trained page links by knowledge base"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/knowledge-bases/crawler"
---

# Get all trained page links by knowledge base

```http
GET /knowledge-bases/crawler
```

Lists discovered and trained website pages for a knowledge base, with pagination and optional URL filter. WHEN TO USE: use this when you need to inspect crawled pages; use discoverWebsite to find new pages; use deleteTrainedUrlsForKnowledgeBase to remove pages the AI should stop using. RETURNS: a paginated list of crawled URLs with status, title, and identifiers.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **knowledgeBaseId** `string` _required_ — knowledge base ID as string
- **locationId** `string` _required_ — location ID as string
- **page** `number` — Page number
- **pageLength** `number` — Records per page
- **query** `string` — query to filter on url links

### Response (200 · application/json)

Trained page links retrieved successfully

**Schema**

- **count** `number` _required_ — Total count of URLs in the knowledge base
- **urls** `object[]` _required_ — Array of crawled URLs with their details

```json
{
  "count": 64,
  "urls": [
    {
      "id": "688c73a25275c513f5f3a7de",
      "url": "https://developer.mozilla.org/en-US/blog",
      "title": "MDN Blog",
      "status": "Successful",
      "locationId": "qIyivCmsuEOSnyoFYEej",
      "knowledgeBaseId": "Arc9QRauPKkSuMJO8D0m",
      "content": "https://storage.googleapis.com/example.txt",
      "contentEditedByUser": false,
      "updatedAt": "2025-08-01T07:58:29.858Z"
    }
  ]
}
```
