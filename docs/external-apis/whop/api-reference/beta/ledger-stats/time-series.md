---
title: "Get time series"
source: "https://docs.whop.com/api-reference/beta/ledger-stats/time-series"
capturado: "2026-08-30"
metodo: "GET"
path: "/api/v1/stats/time_series"
---

# Get time series

> Stats expose aggregated time series built from your account, the same data that powers the Whop dashboard charts. Each query rolls financial activity into periods (`group_by` day, week, or month) over the `from`–`to` window and returns the total `amount` and `line_count` for each, so you can chart revenue, refunds, fees, or net activity without reconstructing raw transactions. Set `resource_type` to choose what you're measuring (ex. `wallet`), pass `account_id` to read a sub-account, and narrow with `reporting_category`, `grouping`, and `line_category` (applied in that order).


<Note>
  Requires the `company:balance:read` permission. See
  [Permissions](/developer/guides/permissions).
</Note>


## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`GET /api/v1/stats/time_series`** — ver [ENDPOINTS-ledger-stats.md](../../../ENDPOINTS-ledger-stats.md#get-api-v1-stats-time-series) · spec: [`openapi/ledger-stats.yaml`](../../../openapi/ledger-stats.yaml)