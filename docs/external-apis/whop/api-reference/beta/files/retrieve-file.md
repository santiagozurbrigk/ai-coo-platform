---
title: "Retrieve File"
source: "https://docs.whop.com/api-reference/beta/files/retrieve-file"
capturado: "2026-08-30"
metodo: "GET"
path: "/files/{id}"
---

# Retrieve File

> Retrieves a file you uploaded — poll it after uploading the bytes to see `upload_status` become `ready`. Only the creator can retrieve a file this way; a file attached to another resource is read through that resource.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`GET /files/{id}`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#get-files-id) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)