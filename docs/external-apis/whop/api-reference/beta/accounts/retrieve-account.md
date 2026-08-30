---
title: "Retrieve Account"
source: "https://docs.whop.com/api-reference/beta/accounts/retrieve-account"
capturado: "2026-08-30"
metodo: "GET"
path: "/accounts/{id}"
---

# Retrieve Account

> Retrieves a single account by ID or public route when it is visible to the credential, including its crypto wallet. The reserved id `me` retrieves the account associated with the current Account API key; user tokens have no single account, so they must address one by ID or route.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`GET /accounts/{id}`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#get-accounts-id) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)