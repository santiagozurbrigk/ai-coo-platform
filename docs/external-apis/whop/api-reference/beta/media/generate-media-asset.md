---
title: "Generate Media Asset"
source: "https://docs.whop.com/api-reference/beta/media/generate-media-asset"
capturado: "2026-08-30"
metodo: "POST"
path: "/media/generate"
---

# Generate Media Asset

> Starts an AI media generation job billed from the account's balance. Generation is asynchronous — poll `GET /media/{id}` until the asset is `ready`, then use `file.id` anywhere attachments are accepted.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`POST /media/generate`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#post-media-generate) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)