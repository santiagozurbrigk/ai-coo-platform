---
title: "Get campaign group reporting"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/li-get-campaign-group-reporting"
seccion: "Ad Manager > LinkedIn Reporting > Get campaign group reporting"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/ad-publishing/linkedin/reporting/campaign-group/:campaignGroupId"
---

# Get campaign group reporting

```http
GET /ad-publishing/linkedin/reporting/campaign-group/:campaignGroupId
```

Retrieve reporting metrics for a specific LinkedIn campaign group

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **campaignGroupId** `string` _required_ — Campaign group identifier

### Query parameters

- **locationId** `string` _required_ — Location ID
- **startDate** `string` _required_ — Start date in yyyy-mm-dd format
- **endDate** `string` _required_ — End date in yyyy-mm-dd format
- **fields** `string[]` — Reporting fields. Pass as comma-separated values on the wire (e.g. ?fields=impressions,clicks).
  - Available options: `clicks`, `oneClickLeads`, `costInLocalCurrency`, `impressions`, `costInUsd`, `ctr`, `cpc`, `cpm`, `cpl`, `externalWebsitePostClickConversions`, `conversionRate`
- **campaignGroupId** `string` — Campaign group ID

### Response (200 · application/json)

Metrics for the campaign group over the period, merged with the stored campaign group

**Schema**

- **impressions** `number` — Impressions
- **clicks** `number` — Clicks
- **oneClickLeads** `number` — Leads captured through a one-click lead form
- **externalWebsitePostClickConversions** `number` — Conversions recorded on an external site after a click
- **ctr** `number` — Click-through rate as a percentage, e.g. 1.40 means 1.40%. Null when it cannot be computed.
- **cpc** `number` — Cost per click in the account currency. Null when it cannot be computed.
- **cpm** `number` — Cost per thousand impressions. Null when it cannot be computed.
- **cpl** `number` — Cost per lead. Null when it cannot be computed.
- **conversionRate** `number` — Conversion rate as a percentage. Null when it cannot be computed.
- **pivotValues** `string[]` _required_ — URNs of the entity this row is pivoted on — a sponsored account, campaign group or creative depending on the request. This is not the time bucket; that is carried by `dateStart`/`dateEnd`.
- **dateStart** `string` _required_ — First day covered by the row
- **dateEnd** `string` _required_ — Last day covered by the row
- **costInUsd** `string` — Spend in USD. Returned as a **string** on grouped rows, unlike in `totals`, and at full source precision — e.g. `899.99999999999988713`. Parse as a decimal rather than a float.
- **costInLocalCurrency** `string` — Spend in the account currency. Returned as a **string** on grouped rows, unlike in `totals`, and at full source precision. Parse as a decimal rather than a float.
- **_id** `string` _required_ — Campaign group record id, as `_id` rather than `id`
- **__v** `number` _required_ — Mongoose internal version key
- **name** `string` _required_ — Campaign group name
- **locationId** `string` _required_ — Location identifier
- **linkedInAdAccountId** `string` _required_ — LinkedIn ad account id
- **publishingStatus** `string` _required_ — Publishing status
- **objectiveType** `string` _required_ — Campaign objective
  - Available options: `LEAD_GENERATION`, `WEBSITE_VISIT`
- **adBudgetOptimization** `string` — Budget optimisation mode
  - Available options: `MAXIMUM_DELIVERY`, `COST_CAP`
- **budget** `object` _required_ — Budget configuration
- **adCampaignGroupId** `string` — LinkedIn campaign group id, set once published
- **linkedInError** `string` _required_ — Publish or review error. Empty string when there is none.
- **createdAt** `string` _required_ — Created at
- **updatedAt** `string` _required_ — Updated at

```json
{
  "impressions": 15230,
  "clicks": 214,
  "oneClickLeads": 8,
  "externalWebsitePostClickConversions": 6,
  "ctr": 1.4,
  "cpc": 0.66,
  "cpm": 9.35,
  "cpl": 17.79,
  "conversionRate": 3.74,
  "pivotValues": [
    "urn:li:sponsoredAccount:509444880"
  ],
  "dateStart": "2026-07-01",
  "dateEnd": "2026-07-31",
  "costInUsd": "576.049999999999648674",
  "costInLocalCurrency": "576.05000000000014868",
  "_id": "693c9998ce9aa51d56fa2c7a",
  "__v": 0,
  "name": "Q3 demand generation",
  "locationId": "ASYI07d4Xt8ifUCwVZyT",
  "linkedInAdAccountId": "509444880",
  "publishingStatus": "PAUSED",
  "objectiveType": "LEAD_GENERATION",
  "adBudgetOptimization": "MAXIMUM_DELIVERY",
  "budget": {
    "budgetType": "DAILY",
    "amount": 30,
    "scheduleStartDate": "2026-08-18T07:40:10.110Z",
    "scheduleEndDate": "2026-09-17T07:40:10.110Z"
  },
  "adCampaignGroupId": "807183436",
  "linkedInError": "",
  "createdAt": "2025-12-12T22:39:20.263Z",
  "updatedAt": "2026-01-12T15:13:52.592Z"
}
```
