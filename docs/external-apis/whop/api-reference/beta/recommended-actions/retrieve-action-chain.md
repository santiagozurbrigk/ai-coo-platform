---
title: "Retrieve Action Chain"
source: "https://docs.whop.com/api-reference/beta/recommended-actions/retrieve-action-chain"
capturado: "2026-08-30"
metodo: "GET"
path: "/recommended_actions/{id}"
---

# Retrieve Action Chain

> Retrieves a recommended action chain by id, including chains that have already been run. Seeded chains are reconstructed from their hard-coded chain; generated chains are read from the account's stored chain, with each step's filled-in input.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`GET /recommended_actions/{id}`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#get-recommended-actions-id) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)