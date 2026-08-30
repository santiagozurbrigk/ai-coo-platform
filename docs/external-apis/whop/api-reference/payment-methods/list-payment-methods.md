---
title: "List payment methods"
source: "https://docs.whop.com/api-reference/payment-methods/list-payment-methods"
capturado: "2026-08-30"
metodo: "GET"
path: "/payment_methods"
---

# List payment methods

> Returns a paginated list of payment methods for a member or company, or for the authenticated user when neither is given, with optional filtering by creation date. A payment method is a stored representation of how a customer intends to pay, such as a card, bank account, or digital wallet.

Required permissions:
 - `member:payment_methods:read`



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`GET /payment_methods`** — ver [ENDPOINTS-api-v1-stable.md](../../ENDPOINTS-api-v1-stable.md#get-payment-methods) · spec: [`openapi/api-v1-stable.json`](../../openapi/api-v1-stable.json)