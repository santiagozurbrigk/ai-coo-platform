---
title: "List Recommended Action Executions"
source: "https://docs.whop.com/api-reference/beta/recommended-actions/list-recommended-action-executions"
capturado: "2026-08-30"
metodo: "GET"
path: "/recommended_actions/{id}/executions"
---

# List Recommended Action Executions

> Lists the per-step record of a recommended action chain the server ran — one entry per step in position order, each carrying its current status and, once the step completed, the API response it produced. A chain that was never run server-side returns an empty list.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`GET /recommended_actions/{id}/executions`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#get-recommended-actions-id-executions) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)