---
title: "Get Sub-Account (Formerly Location)"
source: "https://marketplace.gohighlevel.com/docs/ghl/locations/get-location"
seccion: "Sub-Account (Formerly location) > Sub-Account (Formerly Location) > Get Sub-Account (Formerly Location)"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/locations/:locationId"
---

# Get Sub-Account (Formerly Location)

```http
GET /locations/:locationId
```

Get details of a Sub-Account (Formerly Location) by passing the sub-account id

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location Id

### Response (200 · application/json)

Successful response

**Schema**

- **location** `object`

```json
{
  "location": {
    "id": "ve9EPM428h8vShlRW1KT",
    "companyId": "5DP4iH6HLkQsiKESj6rh",
    "name": "dentist",
    "domain": "test.msgsndr.com",
    "address": "ganthi nagar, gyanbabu chauk motihati",
    "city": "motihari",
    "state": "Loca",
    "logoUrl": "https://dummyimage.com/o/locationPhotos%2Fve9EPM428h8vShlRW1KT.jpeg",
    "country": "IN",
    "postalCode": "567654",
    "website": "https://gohighlevel.com/",
    "timezone": "America/Chicago",
    "firstName": "Dr. Rane",
    "lastName": "deo",
    "email": "[email protected]",
    "phone": "+919039160788",
    "business": {
      "name": "dentist",
      "address": "MIG 14, Delhi",
      "city": "delhi",
      "state": "delhi",
      "country": "IN",
      "postalCode": "567654",
      "website": "https://gohighlevel.com/",
      "timezone": "America/Chicago",
      "logoUrl": "https://dummyimage.com/o/locationPhotos%2Fve9EPM428h8vShlRW1KT.jpeg"
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
    },
    "settings": {
      "allowDuplicateContact": false,
      "allowDuplicateOpportunity": false,
      "allowFacebookNameMerge": false,
      "disableContactTimezone": false
    },
    "reseller": {}
  }
}
```
