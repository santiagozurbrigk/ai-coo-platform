---
title: "List Files"
source: "https://docs.whop.com/api-reference/beta/files/list-files"
capturado: "2026-08-30"
metodo: "GET"
path: "/files"
---

# List Files

> Returns the files with the given IDs, newest first — fetch a batch in one request instead of retrieving each file individually. Only files you created are returned; IDs that do not exist, or that another credential created, are omitted. A request for up to 100 IDs answers in a single page by default; a larger batch pages at up to 100 files per response — follow `page_info` with the same `file_ids` to walk the rest.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`GET /files`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#get-files) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)