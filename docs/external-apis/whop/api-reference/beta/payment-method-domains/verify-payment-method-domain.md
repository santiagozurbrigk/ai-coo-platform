---
title: "Verify Payment Method Domain"
source: "https://docs.whop.com/api-reference/beta/payment-method-domains/verify-payment-method-domain"
capturado: "2026-08-30"
metodo: "POST"
path: "/payment_method_domains/{id}/verify"
---

# Verify Payment Method Domain

> Re-attempts provider verification of a pending domain once the association file is hosted. Fails with a `bad_request` explaining what to fix; verifying an already `verified` domain is a no-op.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`POST /payment_method_domains/{id}/verify`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#post-payment-method-domains-id-verify) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)