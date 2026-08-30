---
title: "Retrieve App"
source: "https://docs.whop.com/api-reference/beta/apps/retrieve-app"
capturado: "2026-08-30"
metodo: "GET"
path: "/apps/{id}"
---

# Retrieve App

> Retrieves an app by ID, claimed route, or proxy domain id. Credential fields (api_key, default_api_key, secrets) render `null` unless the caller has the corresponding developer permission on the owning account.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`GET /apps/{id}`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#get-apps-id) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)