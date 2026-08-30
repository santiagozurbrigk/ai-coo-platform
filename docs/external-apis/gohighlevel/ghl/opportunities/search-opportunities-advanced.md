---
title: "Search Opportunities"
source: "https://marketplace.gohighlevel.com/docs/ghl/opportunities/search-opportunities-advanced"
seccion: "Opportunities > Search > Search Opportunities"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/opportunities/search"
---

# Search Opportunities

```http
POST /opportunities/search
```

Search Opportunities based on combinations of advanced filters. Documentation Link - [https://doc.clickup.com/8631005/d/h/87cpx-424216/7bf11bc9b94f80f](https://doc.clickup.com/8631005/d/h/87cpx-424216/7bf11bc9b94f80f)

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **locationId** `string` _required_ — Location Id
- **query** `string` _required_ — Full-text search query string (max 75 characters)
- **limit** `number` _required_ — Maximum number of results to return per page
- **page** `number` _required_ — Page number (0-indexed)
- **searchAfter** `string[]` _required_ — Search-after cursor values for deep pagination
- **additionalDetails** `object` _required_ — Flags to include additional related entities in the response

```json
{
  "locationId": "i2SpAtBVHSVea1sL6oah",
  "query": "[email protected]",
  "limit": 20,
  "page": 0,
  "searchAfter": [
    1625203104328,
    "yWQobCRIhRguQtD2llvk"
  ],
  "additionalDetails": {
    "notes": false,
    "tasks": false,
    "calendarEvents": false
  }
}
```

### Response (200 · application/json)

Successful response

**Schema**

- **opportunities** `object[]` — List of opportunities matching the search criteria
- **total** `number` _required_ — Total number of opportunities matching the query
- **stageAggregations** `object[]` — Per-stage totals when pipeline filter is present
- **aggregations** `object` — Aggregation results keyed by aggregation name

```json
{
  "opportunities": [],
  "total": 100,
  "stageAggregations": [],
  "aggregations": {}
}
```
