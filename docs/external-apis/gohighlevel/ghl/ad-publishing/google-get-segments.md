---
title: "Get segments"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-get-segments"
seccion: "Ad Manager > Google Ads > Get segments"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/ad-publishing/google/segments"
---

# Get segments

```http
GET /ad-publishing/google/segments
```

Retrieve Google Ads audience segments for a location. Without `limit` the response is a plain array. When `limit` is provided (max 100, default 100) the response is a paginated `{ segments, paging }` envelope; pass `pageToken` (from `paging.next`) to fetch the next batch.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location identifier
- **type** `string` — Segment type
  - Available options: `CUSTOM_SEGMENTS`, `DATA_SEGMENTS`, `ALL`
- **limit** `string` — Page size for a paginated fetch (max 100, defaults to 100). When set, the response is a { segments, paging } envelope instead of a plain array.
- **pageToken** `string` — Opaque cursor for the next batch, taken from the previous response paging.next

### Response (200 · application/json)

A plain array of segments (default), or a { segments, paging } envelope when `limit` is provided

**Schema**

oneOf

Array [

oneOf

- **resourceName** `string` _required_ — Google Ads resource name
- **id** `string` _required_ — Segment id
- **name** `string` _required_ — Segment name
- **status** `string` _required_ — Segment status
- **type** `string` _required_ — Always the literal `CUSTOM_SEGMENTS`. The service overwrites Google's own type with this constant so the value can be used as the discriminator that tells custom-audience entries apart from user-list entries in the merged `ALL` listing.
  - Available options: `CUSTOM_SEGMENTS`
- **interestType** `string` — Google's own custom-audience type, moved here because `type` is reused as the discriminator.
  - Available options: `AUTO`, `INTEREST`, `PURCHASE_INTENT`, `SEARCH`, `UNKNOWN`, `UNSPECIFIED`
- **description** `string` — Segment description

]

```json
[
  {
    "resourceName": "customers/6776452901/customAudiences/874396901",
    "id": "874396901",
    "name": "Running shoe shoppers",
    "status": "ENABLED",
    "type": "CUSTOM_SEGMENTS",
    "interestType": "AUTO",
    "description": "Visitors interested in running shoes"
  },
  {
    "resourceName": "customers/6776452901/userLists/9215680180",
    "id": "9215680180",
    "name": "Website visitors",
    "type": "WEBSITE_VISITOR",
    "status": "ENABLED",
    "membershipStatus": "OPEN",
    "accessReason": "OWNED",
    "accountUserListStatus": "ENABLED",
    "readOnly": false,
    "sizeForDisplay": "0",
    "sizeForSearch": "0",
    "ruleBasedUserList": {
      "prepopulationStatus": "FINISHED"
    },
    "logicalUserList": {}
  }
]
```
