---
title: "Rotate API Key"
source: "https://docs.whop.com/api-reference/beta/api-keys/rotate-api-key"
capturado: "2026-08-30"
metodo: "POST"
path: "/api_keys/{id}/rotate"
---

# Rotate API Key

> Rotates the API key's secret, invalidating the previous secret immediately. The response is the only place the new `secret_key` is returned.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`POST /api_keys/{id}/rotate`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#post-api-keys-id-rotate) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)