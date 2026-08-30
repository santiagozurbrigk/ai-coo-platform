---
title: "Get Google campaign by ID"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-get-campaign-by-id"
seccion: "Ad Manager > Google Ads > Get Google campaign by ID"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/ad-publishing/google/ads/:adId"
---

# Get Google campaign by ID

```http
GET /ad-publishing/google/ads/:adId
```

Retrieve a specific Google Ads campaign by ID

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **adId** `string` _required_ — Ad identifier

### Query parameters

- **locationId** `string` _required_ — Location identifier

### Response (200 · application/json)

The full campaign document, including its ad groups and their ad content

**Schema**

- **id** `string` _required_ — Campaign identifier
- **name** `string` _required_ — Campaign name
- **locationId** `string` _required_ — Location identifier
- **googleAdAccountId** `string` _required_ — Google Ads customer id the campaign belongs to
- **advertisingChannelType** `string` _required_ — Advertising channel
  - Available options: `SEARCH`, `DEMAND_GEN`
- **publishingStatus** `string` _required_ — Publishing status
  - Available options: `DRAFT`, `SCHEDULED`, `PUBLISHED`, `PUBLISHING`, `FAILED`, `IN_REVIEW`, `PAUSED`, `ARCHIVED`, `WITH_ISSUES`, `REJECTED`
- **source** `string` _required_ — Where the campaign was created from
- **budget** `object` _required_ — Budget configuration
- **networkSettings** `object` _required_ — Network placement settings
- **biddingStrategy** `object` _required_ — Bidding configuration
- **campaignGoal** `object` _required_ — Campaign goal
- **assets** `object` _required_ — Attached assets by kind
- **audience** `object` _required_ — Campaign level targeting
- **adSchedule** `object[]` _required_ — Ad scheduling windows, empty when the campaign runs continuously
- **adGroups** `object[]` _required_ — Ad groups with their ads
- **unpublishedChanges** `boolean` _required_ — Whether the campaign has edits not yet published
- **isEuPoliticalAds** `boolean` _required_ — Whether the campaign is declared as EU political advertising
- **meta** `object` — Ancillary campaign metadata
- **createdBy** `string` _required_ — User who created the campaign
- **updatedBy** `string` _required_ — User who last updated the campaign
- **createdAt** `string` _required_ — Created at
- **updatedAt** `string` _required_ — Updated at

```json
{
  "id": "6a846b1eb112242a53b21cb0",
  "name": "Spring promotion",
  "locationId": "fRMewNQIxSyZ5R4nQyit",
  "googleAdAccountId": "6776452901",
  "advertisingChannelType": "DEMAND_GEN",
  "publishingStatus": "DRAFT",
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
  "campaignGoal": {
    "type": "CONVERSIONS",
    "value": "ADD_TO_CART",
    "isCustomConversionGoal": false
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
  "adGroups": [
    {
      "id": "6a846b2db112242a53b21d01",
      "name": "Ad Group 1",
      "adCampaignId": "6a846b1eb112242a53b21cb0",
      "googleAdGroupId": "",
      "publishingStatus": "DRAFT",
      "adGroupError": "",
      "keywords": {
        "positives": [],
        "negatives": []
      },
      "customChannels": false,
      "selectedChannels": [
        "GMAIL",
        "YOUTUBE_IN_STREAM"
      ],
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
      "googleAudienceId": "",
      "adContent": [
        {
          "id": "ad_abc123",
          "name": "Summer Sale Ad",
          "mediaType": "IMAGE",
          "headlines": [
            "Buy Now",
            "Best Deals"
          ],
          "longHeadlines": [
            "Discover Great Deals Today"
          ],
          "descriptions": [
            "Great products"
          ],
          "finalUrl": "https://example.com",
          "path1": "products",
          "path2": "deals",
          "isDeleted": false,
          "adError": "Landing page URL is invalid",
          "publishingStatus": "PUBLISHED",
          "adId": "ad_internal_abc",
          "adCampaignId": "camp_abc123",
          "adGroupId": "ag_abc123",
          "googleAdId": "customers/123/ads/456",
          "media": [
            {
              "type": "IMAGE",
              "src": "https://example.com/ad.jpg"
            }
          ],
          "callToActionLabel": "LEARN_MORE",
          "businessName": "Acme Corp",
          "youtubeVideoLinks": [
            {
              "youtubeVideoId": "dQw4w9WgXcQ"
            }
          ],
          "carouselCards": [
            {
              "headline": "Shop Now",
              "finalUrl": "https://example.com",
              "callToActionLabel": "LEARN_MORE"
            }
          ],
          "placements": [
            "YOUTUBE_IN_STREAM"
          ],
          "customChannels": false
        }
      ],
      "createdAt": "2026-08-18T14:24:45.722Z",
      "updatedAt": "2026-08-18T14:36:29.400Z"
    }
  ],
  "unpublishedChanges": false,
  "isEuPoliticalAds": false,
  "meta": {
    "evaluate": "{\"opportunityScore\":18,\"confidence\":\"High\",\"band\":\"Low\",\"categories\":[],\"fixItems\":[]}"
  },
  "createdBy": "hzN33mfYO5c1LHqsExRC",
  "updatedBy": "hzN33mfYO5c1LHqsExRC",
  "createdAt": "2026-08-18T14:24:30.868Z",
  "updatedAt": "2026-08-18T14:36:29.195Z"
}
```
