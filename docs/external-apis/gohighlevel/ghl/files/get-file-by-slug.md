---
title: "Get File"
source: "https://marketplace.gohighlevel.com/docs/ghl/files/get-file-by-slug"
seccion: "Files > Files > Get File"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/files/d/:slug"
---

# Get File

```http
GET /files/d/:slug
```

Get the file by slug.

## Request

### Path parameters

- **slug** `string` _required_ — Share-link slug identifying the file.

### Response (200 · application/json)

Returns a short-lived download URL and the file's metadata.

**Schema**

- **url** `string` _required_ — Short-lived, signed URL to download the file.
- **asset_id** `string` _required_ — Identifier of the file.
- **content_type** `string` _required_ — MIME type of the file.
- **filename** `string` _required_ — Original filename.
- **size** `integer<int64>` _required_ — File size in bytes.
- **allow_download** `boolean` _required_ — Whether the file may be downloaded.

```json
{
  "url": "https://assets-registry.leadconnectorhq.com/5DP4iH6HLkQsiKESj6rh/4DkigiMRTkqxyAcHwGnO/document/YQPAlfnG8Hzptjg59Anv/019ee07c-564f-785b-bc68-305b4fe30768?Expires=1782375949&KeyName=assets-registry-key&Signature=tnFXYal8xDNonieCM6i4HngcUEM=",
  "asset_id": "019ee07c-564f-785b-bc68-305b4fe30768",
  "content_type": "application/pdf",
  "filename": "🗃️ A Sample File - 11.pdf",
  "size": 18810,
  "allow_download": true
}
```

```json
{
  "allow_download": true,
  "asset_id": "019ee07c-564f-785b-bc68-305b4fe30768",
  "content_type": "application/pdf",
  "filename": "🗃️ A Sample File - 11.pdf",
  "size": 18810,
  "url": "https://assets-registry.leadconnectorhq.com/5DP4iH6HLkQsiKESj6rh/4DkigiMRTkqxyAcHwGnO/document/YQPAlfnG8Hzptjg59Anv/019ee07c-564f-785b-bc68-305b4fe30768?Expires=1782375949&KeyName=assets-registry-key&Signature=tnFXYal8xDNonieCM6i4HngcUEM="
}
```
