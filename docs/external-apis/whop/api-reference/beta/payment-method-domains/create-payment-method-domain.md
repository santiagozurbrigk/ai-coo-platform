---
title: "Create Payment Method Domain"
source: "https://docs.whop.com/api-reference/beta/payment-method-domains/create-payment-method-domain"
capturado: "2026-08-30"
metodo: "POST"
path: "/payment_method_domains"
---

# Create Payment Method Domain

> Registers a hostname with the wallet provider and attempts verification inline. Returns `verified` when the provider fetched the domain-association file (for Apple Pay, `/.well-known/apple-developer-merchantid-domain-association`), or `pending` when it could not — host the file, then retry with the verify endpoint.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`POST /payment_method_domains`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#post-payment-method-domains) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)