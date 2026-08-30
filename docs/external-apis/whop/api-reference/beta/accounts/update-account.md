---
title: "Update Account"
source: "https://docs.whop.com/api-reference/beta/accounts/update-account"
capturado: "2026-08-30"
metodo: "PATCH"
path: "/accounts/{id}"
---

# Update Account

> Updates an account. User tokens can update business accounts; Account API keys can update connected accounts. The reserved id `me` — accepted on Retrieve Account — resolves to the requesting account, which an Account API key cannot edit, so updates must name the connected account by its `biz_` id.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`PATCH /accounts/{id}`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#patch-accounts-id) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)