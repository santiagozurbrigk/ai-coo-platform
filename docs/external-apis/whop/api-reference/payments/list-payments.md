---
title: "List payments"
source: "https://docs.whop.com/api-reference/payments/list-payments"
capturado: "2026-08-30"
metodo: "GET"
path: "/payments"
---

# List payments

> Returns a paginated list of payments for the actor in context, with optional filtering by product, plan, status, billing reason, currency, and creation date.

Required permissions:
 - `payment:basic:read`
 - `plan:basic:read`
 - `access_pass:basic:read`
 - `member:email:read`
 - `member:basic:read`
 - `member:phone:read`
 - `promo_code:basic:read`
 - `shipment:basic:read`



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`GET /payments`** — ver [ENDPOINTS-api-v1-stable.md](../../ENDPOINTS-api-v1-stable.md#get-payments) · spec: [`openapi/api-v1-stable.json`](../../openapi/api-v1-stable.json)