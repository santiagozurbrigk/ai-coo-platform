---
title: "Create File"
source: "https://docs.whop.com/api-reference/beta/files/create-file"
capturado: "2026-08-30"
metodo: "POST"
path: "/files"
---

# Create File

> Creates a file and returns a presigned destination to upload its bytes to. PUT the bytes to `upload_url` (single-part), or to each of `multipart_upload_urls` and then call Complete File Multipart Upload. Once the bytes land the file becomes `ready`, and its ID can be attached wherever a file is accepted — account legal documents, dispute evidence documents. For a step-by-step walkthrough of single-part and multipart uploads, see the [direct file uploads guide](/developer/guides/direct-file-uploads).



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`POST /files`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#post-files) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)