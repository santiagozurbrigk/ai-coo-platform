---
title: "Retrieve ad report"
source: "https://docs.whop.com/api-reference/ad-reports/retrieve-ad-report"
capturado: "2026-08-30"
metodo: "GET"
path: "/ad_reports"
---

# Retrieve ad report

> Performance report for a company, ad campaigns, ad groups, or ads. Always returns aggregate `summary` totals summed across the scope. Set `granularity` to additionally get a time series, or set `breakdown` (`campaign`/`ad_group`/`ad`) to additionally get per-entity rows inside the requested scope. Exactly one of `companyId`, `adCampaignIds`, `adGroupIds`, or `adIds` must be provided.

Required permissions:
 - `ad_campaign:stats:read`



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`GET /ad_reports`** — ver [ENDPOINTS-api-v1-stable.md](../../ENDPOINTS-api-v1-stable.md#get-ad-reports) · spec: [`openapi/api-v1-stable.json`](../../openapi/api-v1-stable.json)