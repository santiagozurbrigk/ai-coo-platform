---
title: "Retry payment"
source: "https://docs.whop.com/api-reference/payments/retry-payment"
capturado: "2026-08-30"
metodo: "POST"
path: "/payments/{id}/retry"
---

# Retry payment

> Retry a failed or pending payment. This re-attempts the charge using the original payment method and plan details.

Required permissions:
 - `payment:manage`
 - `plan:basic:read`
 - `access_pass:basic:read`
 - `member:email:read`
 - `member:basic:read`
 - `member:phone:read`
 - `promo_code:basic:read`
 - `shipment:basic:read`
 - `payment:dispute:read`
 - `payment:resolution_center_case:read`



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`POST /payments/{id}/retry`** — ver [ENDPOINTS-api-v1-stable.md](../../ENDPOINTS-api-v1-stable.md#post-payments-id-retry) · spec: [`openapi/api-v1-stable.json`](../../openapi/api-v1-stable.json)