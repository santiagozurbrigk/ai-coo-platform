---
title: "Get keyword ideas"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-get-keyword-ideas"
seccion: "Ad Manager > Google Ads > Get keyword ideas"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/ad-publishing/google/keyword-ideas"
---

# Get keyword ideas

```http
POST /ad-publishing/google/keyword-ideas
```

Retrieve keyword suggestions for Google Ads campaigns

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location identifier

### Request body (application/json)

**Body required**

- **url** `string` _required_ — Target URL
- **languageCode** `string` — Language code
- **locations** `string[]` — Target locations
- **keywords** `string[]` — Seed keywords

```json
{
  "url": "https://example.com",
  "languageCode": "en",
  "locations": [
    "US",
    "CA"
  ],
  "keywords": [
    "marketing"
  ]
}
```

### Response (200 · application/json)

Keyword suggestions ordered by search volume, highest first

**Schema**

  Array [

  ]

```json
[
  {
    "text": "crm software",
    "avgMonthlySearches": "450000"
  }
]
```
