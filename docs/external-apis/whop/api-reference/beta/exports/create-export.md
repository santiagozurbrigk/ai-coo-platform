---
title: "Create Export"
source: "https://docs.whop.com/api-reference/beta/exports/create-export"
capturado: "2026-08-30"
metodo: "POST"
path: "/exports"
---

# Create Export

> Starts an asynchronous export of a resource for an account. Returns the export in `pending`; poll `GET /exports/{id}` until `download_url` is set.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`POST /exports`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#post-exports) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)