---
title: "Get custom audience by ID"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-get-custom-audience-by-id"
seccion: "Ad Manager > Facebook Ads > Get custom audience by ID"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/ad-publishing/facebook/custom-audience/:audienceId"
---

# Get custom audience by ID

```http
GET /ad-publishing/facebook/custom-audience/:audienceId
```

Retrieve one custom audience with its full detail. Returns more than the listing endpoint: Meta adds the fields relevant to the audience subtype (`retentionDays` and `customerFileSource` for customer lists, `rule` and `pixelId` for website audiences, `lookalikeSpec` for lookalikes), and this service appends `extras` describing the local smart-list or CSV source when the audience is a user-provided customer list.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **audienceId** `string` _required_ — Custom audience identifier

### Query parameters

- **locationId** `string` _required_ — Location identifier

### Response (200 · application/json)

The audience with the fields relevant to its subtype

**Schema**

- **id** `string` — Audience id
- **name** `string` — Audience name
- **description** `string` — Audience description. Empty string when not set.
- **subtype** `string` — How the audience was built. `LOOKALIKE` for lookalikes; `CUSTOM`, `ENGAGEMENT`, `WEBSITE`, and `LEAD` for the rest.
- **approximateCountLowerBound** `number` — Lower bound of the audience size. Facebook floors small audiences — `1000` and `20` are placeholders, not counts.
- **approximateCountUpperBound** `number` — Upper bound of the audience size
- **deliveryStatus** `object` — Whether the audience can be used in a campaign right now
- **operationStatus** `object` — Whether Facebook is still building or refreshing the audience
- **dataSource** `object` — Where the audience gets its members from
- **timeCreated** `number` — Creation time as a Unix timestamp in seconds, not milliseconds and not ISO-8601.
- **timeUpdated** `number` — Last update time as a Unix timestamp in seconds. Equals `timeCreated` when never edited.
- **customerFileSource** `string` — How the member list was supplied. Present on customer-list audiences.
- **retentionDays** `number` — How long a member stays in the audience. `0` means members never expire.
- **rule** `object` — Matching rule for a website audience, as Meta returns it. Structure varies with the rule and is passed through unchanged.
- **pixelId** `string` — Pixel backing a website audience
- **lookalikeSpec** `object` — Seed and ratio settings for a lookalike audience, passed through from Meta
- **lookalikeAudienceIds** `string[]` — Ids of lookalikes derived from this audience
- **extras** `object` — Local sourcing metadata. Added by this service only for user-provided customer lists that have a matching local record; absent otherwise.

```json
{
  "id": "120250373909070122",
  "name": "Website Visitors - Last 30 Days",
  "description": "",
  "subtype": "ENGAGEMENT",
  "approximateCountLowerBound": 19900000,
  "approximateCountUpperBound": 23400000,
  "deliveryStatus": {
    "code": 200,
    "description": "This audience is ready for use."
  },
  "operationStatus": {
    "code": 200,
    "description": "This audience is ready for use."
  },
  "dataSource": {
    "type": "EVENT_BASED",
    "subType": "WEB_PIXEL_HITS",
    "creationParams": "[]"
  },
  "timeCreated": 1787123977,
  "timeUpdated": 1787123977,
  "customerFileSource": "USER_PROVIDED_ONLY",
  "retentionDays": 0,
  "rule": {},
  "pixelId": "2107520276278738",
  "lookalikeSpec": {},
  "lookalikeAudienceIds": [
    "string"
  ],
  "extras": {
    "_id": "6a8668d9867e604d24f5a628",
    "locationId": "fRMewNQIxSyZ5R4nQyit",
    "audienceId": "120250393519390122",
    "type": "SMARTLIST",
    "dynamic": true,
    "sourceName": "contacts.csv",
    "smartLists": [
      {
        "id": "Rd2L2sxaVc1hCQMDKfNm",
        "name": "3 months ago"
      }
    ],
    "createdAt": "2026-08-20T02:39:21.290Z",
    "updatedAt": "2026-08-20T02:39:21.290Z",
    "__v": 0
  }
}
```
