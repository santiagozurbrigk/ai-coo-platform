---
title: "Preview Sitemap URLs"
source: "https://marketplace.gohighlevel.com/docs/ghl/knowledge-base/get-sitemap-preview"
seccion: "Knowledge Base > Web Crawler > Preview Sitemap URLs"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/knowledge-bases/crawler/sitemap-preview"
---

# Preview Sitemap URLs

```http
POST /knowledge-bases/crawler/sitemap-preview
```

Returns a paginated, searchable list of sitemap URLs without starting a crawl. WHEN TO USE: use this when you need to preview sitemap URLs before a crawl; use discoverWebsite to start discovery; use trainDiscoveredUrls after pages are found. RETURNS: a paginated list of sitemap URLs.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **locationId** `string` _required_ — Location ID
- **knowledgeBaseId** `string` — Knowledge base ID
- **url** `string` _required_ — Website URL to preview sitemap for
- **option** `string` _required_ — Crawl mode
  - Available options: `Exact`, `Path`, `Domain`
- **page** `number` — Page number (1-based)
- **pageSize** `number` — Number of URLs per page (10–200)
- **search** `string` — Substring filter applied to URLs

```json
{
  "locationId": "tDtDnQdgm2LXpyiqYvZ6",
  "knowledgeBaseId": "tDtDnQdgm2LXpyiqYvZ6",
  "url": "https://example.com",
  "option": "Path",
  "page": 1,
  "pageSize": 100,
  "search": "/blog"
}
```

### Response (201 · application/json)

Sitemap preview fetched successfully

**Schema**

- **hasSitemap** `boolean` _required_ — Whether a sitemap was found for the URL
- **reason** `string` — Machine-readable reason when the preview is empty or degraded
  - Available options: `NO_SITEMAP`, `FETCH_FAILED`, `FILTERED_EMPTY`, `SEARCH_EMPTY`
- **source** `string` — Where the sitemap URL list came from
  - Available options: `sitemap`, `cache`
- **cached** `boolean` — Whether the raw sitemap URL list was served from preview cache
- **urls** `string[]` _required_ — Paginated slice of matching URLs
- **total** `number` _required_ — Total number of URLs after mode-filter and search
- **page** `number` _required_ — Current page number (1-based)
- **pageSize** `number` _required_ — Page size used
- **totalSitemapUrls** `number` — Total URLs found in the raw sitemap before mode/search filtering
- **modeFilteredTotal** `number` — Total URLs after Path/Domain mode filtering before search filtering

```json
{
  "hasSitemap": true,
  "reason": "NO_SITEMAP",
  "source": "sitemap",
  "cached": false,
  "urls": [
    "https://example.com/page-1",
    "https://example.com/page-2"
  ],
  "total": 42,
  "page": 1,
  "pageSize": 100,
  "totalSitemapUrls": 150,
  "modeFilteredTotal": 80
}
```
