---
title: "Create Payout Quote"
source: "https://docs.whop.com/api-reference/beta/payouts/create-payout-quote"
capturado: "2026-08-30"
metodo: "POST"
path: "/payouts/quotes"
---

# Create Payout Quote

> Creates a short-lived, provider-backed quote for a payout. No funds move until the returned quote_token is submitted to POST /payouts. An Idempotency-Key header is required.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`POST /payouts/quotes`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#post-payouts-quotes) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)