---
title: "Search Opportunity"
source: "https://marketplace.gohighlevel.com/docs/ghl/opportunities/search-opportunity"
seccion: "Opportunities > Search > Search Opportunity"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/opportunities/search"
---

# Search Opportunity

```http
GET /opportunities/search
```

Search Opportunity

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **q** `string` — Search query (max 75 characters)
- **status** `string` — Filter by opportunity status
  - Available options: `open`, `won`, `lost`, `abandoned`, `all`
- **campaignId** `string` — Campaign Id
- **id** `string` — Opportunity Id
- **order** `string` — Sort order for results (e.g. added_asc, added_desc, name_asc, name_desc)
- **endDate** `string` — End date
- **startAfter** `string` — Cursor timestamp (epoch ms) for pagination.
- **startAfterId** `string` — Start After Id
- **date** `string` — Start date
- **country** `string` — Filter by country code (ISO 3166-1 alpha-2)
- **page** `number` — Page number for pagination

  Default value:

  `1`

- **limit** `number` — Limit Per Page records count. will allow maximum up to 100 and default will be 20

  Default value:

  `20`

- **getTasks** `boolean` — get Tasks in contact
- **getNotes** `boolean` — get Notes in contact
- **getCalendarEvents** `boolean` — get Calender event in contact
- **locationId** `string` _required_ — Location Id
- **pipelineId** `string` — Pipeline Id
- **pipelineStageId** `string` — Stage Id
- **contactId** `string` — Contact Id
- **assignedTo** `string` — Filter by assigned user identifier

### Response (200 · application/json)

Successful response

**Schema**

- **opportunities** `object[]` — List of opportunities matching the search criteria
- **meta** `object` — Pagination metadata for the result set
- **aggregations** `object` — Aggregation results keyed by aggregation name

```json
{
  "opportunities": [],
  "meta": {},
  "aggregations": {}
}
```
