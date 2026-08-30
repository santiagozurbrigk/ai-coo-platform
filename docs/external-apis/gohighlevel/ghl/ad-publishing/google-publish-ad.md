---
title: "Publish ad"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-publish-ad"
seccion: "Ad Manager > Google Ads > Publish ad"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/ad-publishing/google/ads/:adId/publish"
---

# Publish ad

```http
POST /ad-publishing/google/ads/:adId/publish
```

Publish a Google ad and push it live

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **adId** `string` _required_ — Ad identifier

### Request body (application/json)

**Body required**

- **locationId** `string` _required_ — Location identifier

```json
{
  "locationId": "HChooFuiyPpVYzeJ4HMe"
}
```

### Response (200 · application/json)

The campaign moved to PUBLISHING. Returns the raw document, so the id is `_id` and `adGroups` are not populated.

**Schema**

- **_id** `string` _required_ — Campaign identifier, as `_id` rather than `id`
- **__v** `number` _required_ — Mongoose internal version key
- **name** `string` _required_ — Campaign name
- **locationId** `string` _required_ — Location identifier
- **googleAdAccountId** `string` _required_ — Google Ads customer id
- **advertisingChannelType** `string` _required_ — Advertising channel
  - Available options: `SEARCH`, `DEMAND_GEN`
- **publishingStatus** `string` _required_ — Status after the publish request, normally `PUBLISHING`
  - Available options: `DRAFT`, `SCHEDULED`, `PUBLISHED`, `PUBLISHING`, `FAILED`, `IN_REVIEW`, `PAUSED`, `ARCHIVED`, `WITH_ISSUES`, `REJECTED`
- **source** `string` _required_ — Where the campaign was created from
- **budget** `object` _required_ — Budget configuration
- **networkSettings** `object` _required_ — Network placement settings
- **biddingStrategy** `object` _required_ — Bidding configuration. `value` is omitted for strategies that do not take a target.
- **assets** `object` _required_ — Attached assets by kind
- **audience** `object` _required_ — Campaign level targeting
- **adSchedule** `object[]` _required_ — Ad scheduling windows
- **meta** `object` — Ancillary campaign metadata
- **googleError** `string` — Publish error from Google, null when the request was accepted
- **isEuPoliticalAds** `boolean` _required_ — Whether the campaign is declared as EU political advertising
- **createdBy** `string` _required_ — User who created the campaign
- **updatedBy** `string` _required_ — User who last updated the campaign
- **createdAt** `string` _required_ — Created at
- **updatedAt** `string` _required_ — Updated at

```json
{
  "_id": "6a8438b2b112242a53b1ea6a",
  "__v": 6,
  "name": "Spring promotion",
  "locationId": "fRMewNQIxSyZ5R4nQyit",
  "googleAdAccountId": "6776452901",
  "advertisingChannelType": "SEARCH",
  "publishingStatus": "PUBLISHING",
  "source": "AD_MANAGER",
  "budget": {
    "budgetType": "DAILY",
    "amount": 50,
    "scheduleStartDate": "2026-08-18T00:00:00.000Z",
    "scheduleEndDate": "2026-09-18T00:00:00.000Z"
  },
  "networkSettings": {
    "targetSearchNetwork": true,
    "targetContentNetwork": false
  },
  "biddingStrategy": {
    "type": "MAXIMIZE_CONVERSIONS",
    "value": 0
  },
  "assets": {
    "calls": [],
    "sitelinks": [],
    "leadForm": "",
    "images": []
  },
  "audience": {
    "locales": [
      {
        "name": "English",
        "key": "1000",
        "id": "1000",
        "resourceName": "languageConstants/1000"
      }
    ],
    "geoLocations": [
      {
        "key": "geoTargetConstants/2840",
        "id": "ChIJOwg_06VPwokRYv534QaPC8g",
        "name": "New York",
        "countryName": "United States",
        "type": "city",
        "radius": 25,
        "radiusUnit": "mi",
        "selectionType": "include",
        "resourceName": "customers/123/geoTargetConstants/2840",
        "placeId": "ChIJOwg_06VPwokRYv534QaPC8g",
        "formattedAddress": "New York, NY, USA",
        "geometry": {
          "location": {
            "lat": 40.7128,
            "lng": -74.006
          },
          "locationType": "APPROXIMATE"
        },
        "addressComponents": [
          {
            "longName": "New York",
            "shortName": "NY",
            "types": [
              "locality",
              "political"
            ]
          }
        ]
      }
    ],
    "gender": [
      {
        "enum": "MALE",
        "negative": false
      }
    ],
    "ageRange": [
      {
        "enum": "AGE_RANGE_25_34",
        "negative": false
      }
    ],
    "segments": [],
    "targetInterests": {
      "affinity": [],
      "inMarket": []
    }
  },
  "adSchedule": [
    {
      "dayOfWeek": "ALL_DAYS",
      "from": "09_00",
      "to": "17_30",
      "_id": "6a855ca9867e604d24f4b8fa"
    }
  ],
  "meta": {
    "evaluate": "{\"opportunityScore\":18,\"confidence\":\"High\",\"band\":\"Low\",\"categories\":[],\"fixItems\":[]}"
  },
  "googleError": null,
  "isEuPoliticalAds": false,
  "createdBy": "uPy3hdVIuuNlbWOpBYGw",
  "updatedBy": "hzN33mfYO5c1LHqsExRC",
  "createdAt": "2026-08-18T10:49:22.412Z",
  "updatedAt": "2026-08-19T08:10:33.333Z"
}
```
