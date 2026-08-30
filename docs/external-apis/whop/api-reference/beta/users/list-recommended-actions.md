---
title: "List Recommended Actions"
source: "https://docs.whop.com/api-reference/beta/users/list-recommended-actions"
capturado: "2026-08-30"
metodo: "GET"
path: "/users/{id}/recommend_actions"
---

# List Recommended Actions

> Lists the recommended actions computed for the user: personal suggestions (e.g. start a business or become an affiliate) pooled with the highest-impact actions across the accounts the user owns. Business actions are tagged with their `account_id`/`account_name`; personal actions leave those `null`. Self-only: `id` must be `me` or the authenticated user's own tag/username.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`GET /users/{id}/recommend_actions`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#get-users-id-recommend-actions) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)