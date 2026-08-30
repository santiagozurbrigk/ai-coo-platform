---
title: "Upsert campaign"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-upsert-campaign"
seccion: "Ad Manager > Facebook Ads > Upsert campaign"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/ad-publishing/facebook/campaigns"
---

# Upsert campaign

```http
PUT /ad-publishing/facebook/campaigns
```

Create or update a Facebook campaign

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **id** `string` — Campaign identifier
- **locationId** `string` _required_ — Location identifier
- **name** `string` — Campaign name
- **objective** `string` — Campaign objective
  - Available options: `OUTCOME_LEADS`, `OUTCOME_TRAFFIC`, `OUTCOME_ENGAGEMENT`, `OUTCOME_SALES`
- **specialAdCategories** `string[]` — Special ad categories
  - Available options: `EMPLOYMENT`, `CREDIT`, `FINANCIAL_PRODUCTS_SERVICES`, `HOUSING`, `ISSUES_ELECTIONS_POLITICS`, `ONLINE_GAMBLING_AND_GAMING`, `NONE`
- **source** `string` — Campaign data source
- **customValueMappings** `object` — User-provided overrides for custom_values merge tags used in ad copy

```json
{
  "id": "camp_123",
  "locationId": "loc_abc123",
  "name": "Summer Campaign",
  "objective": "OUTCOME_LEADS",
  "specialAdCategories": [
    "NONE"
  ],
  "source": "facebook",
  "customValueMappings": {
    "{{ custom_values.pet_name }}": "Fluffy"
  }
}
```

### Response (200 · application/json)

The saved campaign, without its ad sets

**Schema**

- **id** `string` _required_ — Campaign identifier
- **name** `string` _required_ — Campaign name
- **locationId** `string` _required_ — Location identifier
- **fbAdAccountId** `string` _required_ — Ad account the campaign belongs to
- **fbCampaignId** `string` — Facebook campaign id, set once published
- **objective** `string` _required_ — Campaign objective
- **specialAdCategories** `string[]` _required_ — Special ad categories declared for the campaign
- **publishingStatus** `string` _required_ — Publishing status of the campaign itself. Independent of its children — pausing one ad set leaves the campaign `PUBLISHED`.
  - Available options: `DRAFT`, `SCHEDULED`, `PUBLISHING`, `PUBLISHED`, `PAUSED`, `IN_REVIEW`, `WITH_ISSUES`, `REJECTED`, `ARCHIVED`, `FAILED`
- **fbError** `string` — Despite the name this is not always an error. Reads return `null` when there is nothing to report and the upsert returns `""`, but pausing an ad set or an ad overwrites it with an informational notice — `One or more adsets are paused` or `One or more ads are paused` — which the matching resume clears back to `null`. Treat it as a status line, not a failure signal.
- **source** `string` _required_ — Where the campaign was created from
- **meta** `object` — Ancillary campaign metadata
- **unpublishedChanges** `boolean` — Whether the campaign has edits not yet published
- **createdAt** `string` _required_ — Created at
- **updatedAt** `string` _required_ — Updated at

```json
{
  "id": "6a323f3e4454921db1498ccf",
  "name": "Spring promotion",
  "locationId": "fRMewNQIxSyZ5R4nQyit",
  "fbAdAccountId": "act_357046700569338",
  "fbCampaignId": "120250378905720122",
  "objective": "OUTCOME_LEADS",
  "specialAdCategories": [
    "NONE"
  ],
  "publishingStatus": "DRAFT",
  "fbError": null,
  "source": "AD_MANAGER",
  "meta": {
    "evaluate": "{\"opportunityScore\":25,\"band\":\"Low\",\"categories\":[],\"fixItems\":[],\"sacCompliance\":{\"applicable\":false}}"
  },
  "unpublishedChanges": false,
  "createdAt": "2026-06-17T06:31:26.599Z",
  "updatedAt": "2026-08-19T11:45:39.340Z"
}
```
