---
title: "Upsert segment"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-upsert-segment"
seccion: "Ad Manager > Google Ads > Upsert segment"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/ad-publishing/google/segments"
---

# Upsert segment

```http
PUT /ad-publishing/google/segments
```

Create or update a Google Ads audience segment

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location identifier
- **type** `string` _required_ — Segment type
  - Available options: `CUSTOM_SEGMENTS`, `WEBSITE_VISITOR`, `CUSTOMER_MATCH`, `LOOKALIKE`

### Request body (application/json)

**Body required**

- **name** `string` _required_ — Segment name
- **description** `string` — Segment description
- **members** `object[]` — Segment members — keywords, URLs, or apps that define the custom segment
- **status** `string` — Segment status
- **type** `string` — Google custom-audience type, used only when the `type` query parameter is `CUSTOM_SEGMENTS`. Defaults to `AUTO` when omitted. This is NOT the same field as the `type` query parameter, which selects which kind of segment to upsert — settable values here are `AUTO`, `INTEREST`, `PURCHASE_INTENT` and `SEARCH`.
- **id** `string` — Segment identifier
- **membershipStatus** `string` — Membership status
- **ruleBasedUserList** `object` — Rule-based user list config
- **membershipLifeSpan** `number` — Membership life span
- **seedUserListIds** `string[]` — Seed user list IDs
- **countryCodes** `string[]` — Country codes
- **expansionLevel** `string` — Expansion level
  - Available options: `BALANCED`, `BROAD`, `NARROW`

```json
{
  "name": "My Segment",
  "description": "Target audience segment",
  "members": [
    {
      "memberType": "KEYWORD",
      "keyword": "digital marketing"
    },
    {
      "memberType": "URL",
      "url": "https://example.com"
    },
    {
      "memberType": "APP",
      "app": "com.example.app"
    }
  ],
  "status": "ENABLED",
  "type": "AUTO",
  "id": "seg_123",
  "membershipStatus": "OPEN",
  "ruleBasedUserList": {
    "prepopulationStatus": "REQUESTED",
    "flexibleRuleUserList": {
      "inclusiveOperands": [],
      "exclusiveOperands": []
    }
  },
  "membershipLifeSpan": 30,
  "seedUserListIds": [
    "list_1"
  ],
  "countryCodes": [
    "US",
    "CA"
  ],
  "expansionLevel": "BALANCED"
}
```

### Response (200 · application/json)

The saved segment, shaped by the requested `type`: a custom audience for `CUSTOM_SEGMENTS`, or a Google user list for `DATA_SEGMENTS`.

**Schema**

oneOf

- **resourceName** `string` _required_ — Google Ads resource name
- **id** `string` _required_ — Segment id
- **status** `string` _required_ — Segment status
- **name** `string` _required_ — Segment name
- **type** `string` _required_ — Google custom-audience type. `AUTO` is the default applied when none is supplied on create.
- **members** `object[]` _required_ — Keywords, URLs and apps that define the segment

```json
{
  "resourceName": "customers/6776452901/customAudiences/874396901",
  "id": "874396901",
  "status": "ENABLED",
  "name": "Running shoe shoppers",
  "type": "AUTO",
  "members": [
    {
      "memberType": "KEYWORD",
      "keyword": "running shoes",
      "url": "www.example.com",
      "app": "app.example.com"
    }
  ]
}
```
