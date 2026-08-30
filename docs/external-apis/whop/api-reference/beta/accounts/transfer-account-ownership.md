---
title: "Transfer Account Ownership"
source: "https://docs.whop.com/api-reference/beta/accounts/transfer-account-ownership"
capturado: "2026-08-30"
metodo: "POST"
path: "/accounts/{id}/transfer_ownership"
---

# Transfer Account Ownership

> Transfers ownership of the account to another user, identified by user ID or email address. If the recipient already holds the owner role, ownership moves immediately; otherwise they get an invite and ownership moves when they accept.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`POST /accounts/{id}/transfer_ownership`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#post-accounts-id-transfer-ownership) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)