---
title: "List Memberships"
source: "https://docs.whop.com/api-reference/beta/memberships/list-memberships"
capturado: "2026-08-30"
metodo: "GET"
path: "/memberships"
---

# List Memberships

> Lists every membership the caller can read: an account API key its account's; a user credential their own plus those of every account they manage. `account_id` and `user_id` only narrow that list — values outside the caller's reach return fewer results, not an error.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`GET /memberships`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#get-memberships) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)