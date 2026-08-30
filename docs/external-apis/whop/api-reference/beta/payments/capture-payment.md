---
title: "Capture payment"
source: "https://docs.whop.com/api-reference/beta/payments/capture-payment"
capturado: "2026-08-30"
metodo: "POST"
path: "/payments/{id}/capture"
---

# Capture payment

> Captures the full amount of a card payment created with `capture: false`. The payment must still be in `requires_capture` before `capture_expires_at`. Partial capture, multiple captures, capturing more than the authorized amount, and tips are not supported.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`POST /payments/{id}/capture`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#post-payments-id-capture) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)