---
title: "Search targeting options"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-search-targeting"
seccion: "Ad Manager > Facebook Ads > Search targeting options"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/ad-publishing/facebook/targeting/search"
---

# Search targeting options

```http
GET /ad-publishing/facebook/targeting/search
```

Search Facebook targeting options for ad set audience building. `type` selects which taxonomy is searched and determines the response shape: `geolocation` returns places, `interest` returns interests, behaviours, and demographics, and `language` returns locales. Geolocation and interest results are passed through from Facebook, so their fields are snake_case.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` — Location identifier
- **type** `string` _required_ — Targeting search type
  - Available options: `geolocation`, `interest`, `language`
- **query** `string` _required_ — Search query string
- **searchType** `string` — Specific search subtype

### Response (200 · application/json)

Matching targeting options. The item shape follows the requested `type`: geo results for `geolocation`, interest/behaviour/demographic results for `interest` (sorted by estimated reach, largest first), and locales for `language`.

**Schema**

  Array [

  ]

```json
[
  {
    "key": "1045272",
    "name": "Thane",
    "type": "city",
    "country_code": "IN",
    "country_name": "India",
    "region": "Maharashtra",
    "region_id": 1735,
    "supports_region": true,
    "supports_city": true,
    "geo_hierarchy_level": "NEIGHBORHOOD",
    "geo_hierarchy_name": "CITY"
  },
  {
    "id": "6003195226065",
    "name": "Tabletop game",
    "type": "interests",
    "subText": "interests",
    "path": [
      "Interests",
      "Technology",
      "Computers",
      "Tablet computers"
    ],
    "description": "People who primarily access Facebook using a tablet",
    "audience_size_lower_bound": 512619285,
    "audience_size_upper_bound": 602840280,
    "topic": "Technology",
    "disambiguation_category": "Computers (Brand)",
    "real_time_cluster": false
  },
  {
    "key": 1004,
    "name": "Chinese (All)"
  }
]
```
