---
title: "Search"
source: "https://marketplace.gohighlevel.com/docs/ghl/locations/search-locations"
seccion: "Sub-Account (Formerly location) > Search > Search"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/locations/search"
---

# Search

```http
GET /locations/search
```

Search Sub-Account (Formerly Location)

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **companyId** `string` — The company/agency id on which you want to perform the search
- **skip** `string` — The value by which the results should be skipped. Default will be 0

  Default value:

  `0`

- **limit** `string` — The value by which the results should be limited. Default will be 10

  Default value:

  `10`

- **order** `string` — The order in which the results should be returned - Allowed values asc, desc. Default will be asc

  Default value:

  `asc`

- **email** `string`

### Response (200 · application/json)

Successful response

**Schema**

- **locations** `object[]`

```json
{
  "locations": [
    {
      "id": "ve9EPM428h8vShlRW1KT",
      "name": "Mark Shoes",
      "phone": "+1410039940",
      "email": "[email protected]",
      "address": "4th fleet street",
      "city": "New York",
      "state": "Illinois",
      "country": "US",
      "postalCode": "567654",
      "website": "https://yourwebsite.com",
      "timezone": "US/Central",
      "settings": {
        "allowDuplicateContact": false,
        "allowDuplicateOpportunity": false,
        "allowFacebookNameMerge": false,
        "disableContactTimezone": false
      },
      "social": {
        "facebookUrl": "https://www.facebook.com/",
        "googlePlus": "https://www.googleplus.com/",
        "linkedIn": "https://www.linkedIn.com/",
        "foursquare": "https://www.foursquare.com/",
        "twitter": "https://www.foutwitterrsquare.com/",
        "yelp": "https://www.yelp.com/",
        "instagram": "https://www.instagram.com/",
        "youtube": "https://www.youtube.com/",
        "pinterest": "https://www.pinterest.com/",
        "blogRss": "https://www.blogRss.com/",
        "googlePlacesId": "ChIJJGPdVbQTrjsRGUkefteUeFk"
      }
    }
  ]
}
```
