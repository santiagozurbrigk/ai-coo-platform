---
title: "Schema"
source: "https://docs.whop.com/api-reference/beta/ledger-stats/schema"
capturado: "2026-08-30"
metodo: "GET"
path: "/api/v1/stats/schema"
---

# Schema

> Returns the full structure of reporting categories, groupings, and line categories
with human-readable descriptions. Use this to discover valid filter values for
the time_series endpoint and understand what each value means.

**Call this first** before constructing time_series queries to understand the
available filters and what financial data each one represents.


No authentication required. Call this endpoint to discover all available filter values
for the [time\_series](/api-reference/beta/ledger-stats/time-series) endpoint with
human-readable descriptions.


## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`GET /api/v1/stats/schema`** — ver [ENDPOINTS-ledger-stats.md](../../../ENDPOINTS-ledger-stats.md#get-api-v1-stats-schema) · spec: [`openapi/ledger-stats.yaml`](../../../openapi/ledger-stats.yaml)