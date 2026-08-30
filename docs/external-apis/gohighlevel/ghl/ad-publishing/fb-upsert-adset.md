---
title: "Upsert adset"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-upsert-adset"
seccion: "Ad Manager > Facebook Ads > Upsert adset"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/ad-publishing/facebook/adsets"
---

# Upsert adset

```http
PUT /ad-publishing/facebook/adsets
```

Create or update a Facebook ad set

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **id** `string` — Ad set identifier
- **locationId** `string` _required_ — Location identifier
- **name** `string` — Ad set name
- **pageId** `string` — Facebook page ID
- **instagramActorId** `string` — Instagram actor ID
- **messagingPlatforms** `string[]` — Messaging platforms
  - Available options: `WHATSAPP`, `MESSENGER`, `INSTAGRAM_DIRECT`
- **whatsappNumber** `string` — WhatsApp phone number
- **audience** `object` — Targeting audience configuration including geo-locations, locales, placements, and custom audiences
- **budget** `object` — Ad set budget config
- **conversionLocation** `string` — Where the conversion happens. Valid values depend on the parent campaign objective — OUTCOME_LEADS: `on_ad` (instant form), `website`, `website_and_lead_form`; OUTCOME_SALES: `website` (pixel), `messaging`. Not validated server-side, so values outside this set are forwarded to Facebook and may be rejected there.
- **customEventType** `string` — Facebook standard event optimised for. Only meaningful when `conversionLocation` is `website` (requires `pixelId`). Valid values depend on the parent campaign objective — OUTCOME_LEADS: `COMPLETE_REGISTRATION`, `CONTACT`, `CONTENT_VIEW`, `FIND_LOCATION`, `LEAD`, `SCHEDULE`, `SEARCH`, `START_TRIAL`, `SUBMIT_APPLICATION`, `SUBSCRIBE`; OUTCOME_SALES: `ADD_PAYMENT_INFO`, `ADD_TO_CART`, `ADD_TO_WISHLIST`, `COMPLETE_REGISTRATION`, `CONTENT_VIEW`, `DONATE`, `INITIATED_CHECKOUT`, `PURCHASE`, `SEARCH`, `START_TRIAL`, `SUBSCRIBE`. Not validated server-side, so values outside this set are forwarded to Facebook and may be rejected there.
- **pixelId** `string` — Conversion pixel ID
- **campaignId** `string` _required_ — Parent campaign ID

```json
{
  "id": "adset_123",
  "locationId": "loc_abc123",
  "name": "Targeting Group A",
  "pageId": "123456789",
  "instagramActorId": "ig_123",
  "messagingPlatforms": [
    "WHATSAPP"
  ],
  "whatsappNumber": "+1234567890",
  "audience": {
    "geoLocations": [
      {
        "key": "US",
        "name": "United States",
        "type": "country",
        "selectionType": "include"
      }
    ],
    "ageMin": 18,
    "ageMax": 65,
    "genders": [
      1,
      2
    ]
  },
  "budget": {
    "budgetType": "DAILY",
    "amount": 1000,
    "scheduleStartDate": "2024-01-01",
    "scheduleEndDate": "2024-01-31"
  },
  "conversionLocation": "website",
  "customEventType": "PURCHASE",
  "pixelId": "px_123",
  "campaignId": "camp_123"
}
```

### Response (200 · application/json)

The saved ad set

**Schema**

- **id** `string` _required_ — Ad set identifier
- **name** `string` _required_ — Ad set name
- **campaignId** `string` _required_ — Parent campaign id
- **fbAdSetId** `string` — Facebook ad set id, set once published
- **publishingStatus** `string` _required_ — Publishing status. On a published entity this is not the state you asked for but the `effective_status` Meta reports, mapped back — a pause or resume re-reads it live, so an ad awaiting review comes back `IN_REVIEW` rather than `PAUSED` or `PUBLISHED`. Any effective status this service does not recognise also maps to `IN_REVIEW`.
  - Available options: `DRAFT`, `SCHEDULED`, `PUBLISHING`, `PUBLISHED`, `PAUSED`, `IN_REVIEW`, `WITH_ISSUES`, `REJECTED`, `ARCHIVED`, `FAILED`
- **fbError** `string` — Publish error from Facebook. `null` on reads when there is none.
- **pageId** `string` _required_ — Page the ads run under
- **instagramActorId** `string` — Instagram account the ads run under. `null` when not linked.
- **messagingPlatforms** `string[]` _required_ — Messaging destinations for click-to-message ads. Empty for other conversion locations.
- **conversionLocation** `string` — Where the conversion happens
- **budget** `object` _required_ — Budget configuration
- **audience** `object` _required_ — Targeting
- **unpublishedChanges** `boolean` — Whether the ad set has edits not yet published
- **createdAt** `string` _required_ — Created at
- **updatedAt** `string` _required_ — Updated at

```json
{
  "id": "6a323f3f4454921db1498cd8",
  "name": "Ad set 1",
  "campaignId": "6a323f3e4454921db1498ccf",
  "fbAdSetId": "120250378906150122",
  "publishingStatus": "PUBLISHED",
  "fbError": null,
  "pageId": "196684453527082",
  "instagramActorId": null,
  "messagingPlatforms": [],
  "conversionLocation": "on_ad",
  "budget": {
    "budgetType": "DAILY",
    "amount": 1,
    "actualAmount": 1
  },
  "audience": {
    "genders": [
      0
    ],
    "geoLocations": [
      {
        "key": "IN",
        "name": "India",
        "type": "country",
        "selectionType": "include",
        "radius": 17,
        "radiusUnit": "km",
        "geometry": {
          "location": {
            "lat": 20.593684,
            "lng": 78.96288
          },
          "locationType": "APPROXIMATE"
        }
      }
    ],
    "ageMin": 18,
    "ageMax": 65,
    "interests": [
      {
        "id": "6016286626383",
        "name": "Facebook access (mobile): tablets",
        "type": "behaviors"
      }
    ],
    "placements": {
      "facebook": [
        "feed",
        "story"
      ],
      "instagram": [
        "reels"
      ],
      "messenger": [
        "messenger_home"
      ]
    },
    "placementType": "manual"
  },
  "unpublishedChanges": false,
  "createdAt": "2026-06-17T06:31:27.129Z",
  "updatedAt": "2026-08-19T11:42:35.835Z"
}
```
