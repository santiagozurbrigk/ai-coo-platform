---
title: "Get campaign reporting"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-get-campaign-reporting"
seccion: "Ad Manager > Facebook Reporting > Get campaign reporting"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/ad-publishing/facebook/reporting/campaign/:campaignId"
---

# Get campaign reporting

```http
GET /ad-publishing/facebook/reporting/campaign/:campaignId
```

Retrieve reporting for one campaign as a flat object, not the `{ grouped, totals }` envelope the account-level report uses. Merges the locally stored campaign, Meta insights for the window, and CDP-attributed contacts. The campaign must be published — one without an `fbCampaignId` is rejected. Note `results.lead` (Meta lead actions) and `leads` (CDP attributed contacts) measure different things and routinely disagree.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **campaignId** `string` _required_ — Campaign identifier

### Query parameters

- **locationId** `string` _required_ — Location identifier
- **startDate** `string` _required_ — Report start date (YYYY-MM-DD)
- **endDate** `string` _required_ — Report end date (YYYY-MM-DD)

### Response (200 · application/json)

Campaign metadata, Meta insights, and attributed contacts for the window

**Schema**

- **_id** `string` _required_ — Campaign id in this service. Note `_id`, not `id`.
- **name** `string` _required_ — Campaign name
- **objective** `string` _required_ — Campaign objective
- **publishingStatus** `string` _required_ — Local publishing status
- **fbCampaignId** `string` _required_ — Meta campaign id. Required — an unpublished campaign is rejected.
- **campaignId** `string` — Meta campaign id, repeated from the insights row
- **startTime** `string` — When the campaign started, in Meta timestamp format with a numeric offset rather than UTC
- **stopTime** `string` — When the campaign is scheduled to stop. Absent on open-ended campaigns.
- **dateStart** `string` — First day of the reported window
- **dateStop** `string` — Last day of the reported window
- **clicks** `string` — Clicks
- **cpc** `string` — Cost per click
- **ctr** `string` — Click-through rate as a percentage
- **cpm** `string` — Cost per thousand impressions
- **impressions** `string` — Impressions
- **spend** `string` — Spend
- **reach** `string` — Unique people reached
- **frequency** `string` — Average impressions per person reached
- **conversions** `string` — Lead actions Meta recorded. A string here, unlike the account-level report where the same figure is a number.
- **costPerConversion** `string` — Spend divided by lead actions
- **results** `object` — Counts per Meta action type. Values are strings, and the types overlap so summing them double-counts.
- **costPerResult** `string` — Spend divided by the double-counted `results` total, so usually far smaller than the real cost per lead
- **costPerResultBreakdown** `object` — Cost per action, per action type, at four decimals
- **leads** `string` — Contacts the CDP attributed to this campaign. A different measurement from `results.lead`, which counts Meta lead actions — expect the two to differ.

```json
{
  "_id": "6890a65597bae1febe1581d1",
  "name": "Do not touch - Lead Form Campaign",
  "objective": "OUTCOME_LEADS",
  "publishingStatus": "PAUSED",
  "fbCampaignId": "120229485769880122",
  "campaignId": "120229485769880122",
  "startTime": "2025-08-04T05:24:01-0700",
  "stopTime": "2026-09-01T00:00:00-0700",
  "dateStart": "2025-08-01",
  "dateStop": "2026-08-19",
  "clicks": "32",
  "cpc": "0.03625",
  "ctr": "1.440792",
  "cpm": "0.522287",
  "impressions": "2221",
  "spend": "1.16",
  "reach": "2214",
  "frequency": "1.003162",
  "conversions": "5",
  "costPerConversion": "0.232",
  "results": {
    "lead": "5",
    "linkClick": "22"
  },
  "costPerResult": "0.01",
  "costPerResultBreakdown": {
    "lead": "0.2320",
    "linkClick": "0.0527"
  },
  "leads": "4"
}
```
