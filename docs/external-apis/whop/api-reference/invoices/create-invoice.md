---
title: "Create invoice"
source: "https://docs.whop.com/api-reference/invoices/create-invoice"
capturado: "2026-08-30"
metodo: "POST"
path: "/invoices"
---

# Create invoice

> Create an invoice for a customer. The invoice can be charged automatically using a stored payment method, or sent to the customer for manual payment.

Required permissions:
 - `invoice:create`
 - `member:email:read`
 - `member:basic:read`
 - `payment:basic:read`



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`POST /invoices`** — ver [ENDPOINTS-api-v1-stable.md](../../ENDPOINTS-api-v1-stable.md#post-invoices) · spec: [`openapi/api-v1-stable.json`](../../openapi/api-v1-stable.json)