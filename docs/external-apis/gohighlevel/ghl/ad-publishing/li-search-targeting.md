---
title: "Search targeting options"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/li-search-targeting"
seccion: "Ad Manager > LinkedIn Ads > Search targeting options"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/ad-publishing/linkedin/targeting/search"
---

# Search targeting options

```http
GET /ad-publishing/linkedin/targeting/search
```

Search LinkedIn targeting facets such as locations, industries, and job titles

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location identifier
- **facet** `string` _required_ — Targeting facet
- **query** `string` — Search query
- **q** `string` — Query parameter

### Response (200 · application/json)

Matching targeting entities for the requested facet

**Schema**

  Array [

  ]

```json
[
  {
    "name": "Mumbai, Maharashtra, India",
    "urn": "urn:li:geo:106164952",
    "facetUrn": "urn:li:adTargetingFacet:locations"
  }
]
```
