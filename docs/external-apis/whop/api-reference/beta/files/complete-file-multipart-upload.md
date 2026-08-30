---
title: "Complete File Multipart Upload"
source: "https://docs.whop.com/api-reference/beta/files/complete-file-multipart-upload"
capturado: "2026-08-30"
metodo: "POST"
path: "/files/{id}/complete"
---

# Complete File Multipart Upload

> Assembles the parts of a multipart upload after every part has been PUT to its presigned URL. Pass the `multipart_upload_id` from Create File and each part's `ETag` response header. For a step-by-step walkthrough of multipart uploads, see the [direct file uploads guide](/developer/guides/direct-file-uploads).



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`POST /files/{id}/complete`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#post-files-id-complete) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)