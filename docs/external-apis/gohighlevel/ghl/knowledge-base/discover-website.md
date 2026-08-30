---
title: "Start crawling and discover pages for training"
source: "https://marketplace.gohighlevel.com/docs/ghl/knowledge-base/discover-website"
seccion: "Knowledge Base > Web Crawler > Start crawling and discover pages for training"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/knowledge-bases/crawler"
---

# Start crawling and discover pages for training

```http
POST /knowledge-bases/crawler
```

Starts a website crawl that discovers pages for later AI training. WHEN TO USE: use this when you need to scan a site before training; use trainDiscoveredUrls to ingest selected pages; use getCrawlingStatusForLatestOperation to poll progress. RETURNS: the discovery operation id, current status, and the URL being crawled.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **locationId** `string` _required_ — Location ID as string
- **url** `string` _required_ — Website URL as string
- **option** `string` _required_ — Mode as string
  - Available options: `Exact`, `Path`, `Domain`
- **knowledgeBaseId** `string` _required_ — knowledge base ID as string
- **preSelectedUrls** `string[]` — Pre-selected URLs from sitemap preview — when provided, only these URLs are crawled
- **autoTrain** `boolean` — Automatically train the discovered URLs after crawling

```json
{
  "locationId": "tDtDnQdgm2LXpyiqYvZ6",
  "url": "https://kubernetes.io/tDtDnQdgm2LXpyiqYvZ6",
  "option": "Exact",
  "knowledgeBaseId": "tDtDnQdgm2LXpyiqYvZ6",
  "preSelectedUrls": [
    "https://example.com/page-1",
    "https://example.com/page-2"
  ],
  "autoTrain": false
}
```

### Response (201 · application/json)

Crawling and discovery started successfully

**Schema**

- **operationId** `string` _required_ — Operation ID for tracking the discovery process
- **status** `string` _required_ — Current status of the website discovery operation
  - Available options: `Pending`, `Processing`, `Successful`, `Failed`, `Existing`, `Restricted`, `Cancelled`, `Aborted`, `Training`
- **url** `string` _required_ — The URL being discovered/crawled

```json
{
  "operationId": "op_abc123xyz",
  "status": "Processing",
  "url": "https://example.com"
}
```
