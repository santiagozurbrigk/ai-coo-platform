---
title: "Create Confirmation Token"
source: "https://docs.whop.com/api-reference/beta/confirmation-tokens/create-confirmation-token"
capturado: "2026-08-30"
metodo: "POST"
path: "/confirmation_tokens"
---

# Create Confirmation Token

> Mints a single-use, short-lived confirmation token from what the buyer entered on your collection surface: the payment method payload, billing details, and attested save consent. Public and rate-limited — the account_id in the body scopes the token but does not authenticate. Confirm it with POST /payments from your server.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`POST /confirmation_tokens`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#post-confirmation-tokens) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)