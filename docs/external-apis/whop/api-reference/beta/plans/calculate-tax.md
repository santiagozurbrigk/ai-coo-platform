---
title: "Calculate Tax"
source: "https://docs.whop.com/api-reference/beta/plans/calculate-tax"
capturado: "2026-08-30"
metodo: "POST"
path: "/plans/{id}/calculate_tax"
---

# Calculate Tax

> Previews tax for a plan before checkout, based on the buyer's location.

Use it in a checkout preview to show the buyer their subtotal, tax, and total. The request only reads data. It doesn't create a checkout, reserve inventory, or charge the buyer.


## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`POST /plans/{id}/calculate_tax`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#post-plans-id-calculate-tax) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)