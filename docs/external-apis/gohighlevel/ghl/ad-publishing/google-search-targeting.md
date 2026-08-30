---
title: "Search targeting options"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-search-targeting"
seccion: "Ad Manager > Google Ads > Search targeting options"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/ad-publishing/google/targeting/search"
---

# Search targeting options

```http
GET /ad-publishing/google/targeting/search
```

Search Google geo-locations for ad targeting

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **type** `string` _required_ — Search type
  - Available options: `geolocation`, `language`
- **query** `string` — Search query
- **locationId** `string` _required_ — Location identifier

### Response (200 · application/json)

Geo targets when type=geolocation, or language constants when type=language

**Schema**

oneOf

Array [

- **resourceName** `string` _required_ — Google Ads resource name
- **id** `string` _required_ — Geo target constant id
- **status** `string` _required_ — Target status
- **name** `string` _required_ — Location name
- **countryCode** `string` _required_ — Two-letter ISO country code
- **targetType** `string` _required_ — Granularity of the target, e.g. Country, State, City, District, Postal Code
- **canonicalName** `string` _required_ — Fully qualified name, comma separated from most to least specific
- **reach** `string` _required_ — Approximate addressable population, returned as a string rather than a number

]

```json
[
  {
    "resourceName": "geoTargetConstants/9040245",
    "id": "9040245",
    "status": "ENABLED",
    "name": "Thane",
    "countryCode": "IN",
    "targetType": "City",
    "canonicalName": "Thane,Thane,Maharashtra,India",
    "reach": "3000000"
  }
]
```
