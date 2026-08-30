---
title: "Deploy App"
source: "https://docs.whop.com/api-reference/beta/apps/deploy-app"
capturado: "2026-08-30"
metodo: "POST"
path: "/apps/{id}/deploy"
---

# Deploy App

> Builds the app's current source and ships it. Returns the run it started, so the caller can render progress from this response and then follow it on the app's `deployment` field. Only one deployment runs per app at a time — calling this while one is in flight reports that run rather than starting a second, and calling it with nothing to publish reports that instead of starting one.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`POST /apps/{id}/deploy`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#post-apps-id-deploy) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)