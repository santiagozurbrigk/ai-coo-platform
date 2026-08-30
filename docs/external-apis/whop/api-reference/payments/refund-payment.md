---
title: "Refund payment"
source: "https://docs.whop.com/api-reference/payments/refund-payment"
capturado: "2026-08-30"
metodo: "POST"
path: "/payments/{id}/refund"
---

# Refund payment

> Issue a full or partial refund for a payment. The refund is processed through the original payment processor and the membership status is updated accordingly.

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

> **`POST /payments/{id}/refund`** — ver [ENDPOINTS-api-v1-stable.md](../../ENDPOINTS-api-v1-stable.md#post-payments-id-refund) · spec: [`openapi/api-v1-stable.json`](../../openapi/api-v1-stable.json)