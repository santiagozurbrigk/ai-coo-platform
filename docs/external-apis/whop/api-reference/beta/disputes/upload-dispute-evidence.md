---
title: "Upload Dispute Evidence"
source: "https://docs.whop.com/api-reference/beta/disputes/upload-dispute-evidence"
capturado: "2026-08-30"
metodo: "POST"
path: "/disputes/{id}/upload_evidence"
---

# Upload Dispute Evidence

> Replaces the full set of uploaded evidence documents on a dispute, beyond the four fixed evidence slots. Upload files through `POST /files` and reference them by `id`, or send the files as multipart file parts to upload and attach in one call. Send every document the packet should carry — up to 10, 10MB each and 25MB in total; an empty list removes them all. Accepted content types: application/pdf, application/json, image/jpeg, image/png, image/webp — any other type is rejected.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`POST /disputes/{id}/upload_evidence`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#post-disputes-id-upload-evidence) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)