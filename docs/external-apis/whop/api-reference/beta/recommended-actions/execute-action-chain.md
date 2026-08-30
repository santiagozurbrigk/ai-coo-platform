---
title: "Execute Action Chain"
source: "https://docs.whop.com/api-reference/beta/recommended-actions/execute-action-chain"
capturado: "2026-08-30"
metodo: "POST"
path: "/recommended_actions/{id}"
---

# Execute Action Chain

> Records that the caller ran a recommended action chain. Nothing is executed server-side yet — the client follows the chain's step CTAs itself; this writes the `recommended_action_chain.executed` analytics event.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`POST /recommended_actions/{id}`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#post-recommended-actions-id) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)