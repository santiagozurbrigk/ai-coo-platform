---
title: "Get crawling status for the latest operation"
source: "https://marketplace.gohighlevel.com/docs/ghl/knowledge-base/get-crawling-status-for-latest-operation"
seccion: "Knowledge Base > Web Crawler > Get crawling status for the latest operation"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/knowledge-bases/crawler/status"
---

# Get crawling status for the latest operation

```http
GET /knowledge-bases/crawler/status
```

Fetches crawl/train progress for a specific operation, or the latest operation when operationId is omitted. WHEN TO USE: use this when you need to poll a discoverWebsite or trainDiscoveredUrls run; do not use it to start a crawl or train pages. RETURNS: aggregated counts by status plus detailed operation information.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location ID as string
- **operationId** `string` — operation id as string (optional - gets latest if not provided)
- **knowledgeBaseId** `string` _required_ — knowledge base id

### Response (200 · application/json)

Operation status fetched successfully

**Schema**

- **aggregate** `object[]` _required_ — Aggregated crawling results by status
- **operationDetails** `object` _required_ — Detailed operation information

```json
{
  "aggregate": [
    {
      "_id": "Failed",
      "records": [
        {
          "url": "https://developer.mozilla.org/en-US/blog/rss.xml",
          "id": "688e41118a188704914d13c0"
        }
      ]
    }
  ],
  "operationDetails": {}
}
```
