---
title: "Apply watermark to an image"
source: "https://marketplace.gohighlevel.com/docs/ghl/social-planner/apply-watermark-to-image"
seccion: "Social Planner > Watermarks > Apply watermark to an image"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/social-media-posting/:locationId/watermarks/add-image-watermark"
---

# Apply watermark to an image

```http
POST /social-media-posting/:locationId/watermarks/add-image-watermark
```

Apply a watermark to an image using either a specific template ID or by resolving the template bound to a specific connected account.

If the same watermark + image combination has been processed before, the response returns immediately with `status: completed` and the output URL in `message`. Otherwise, processing is queued and the response returns `status: pending` with a `progressId`.

**Rate limits:** This endpoint may be rate-limited to prevent abuse. To resolve a template dynamically at publish time, pass `accountId` — the endpoint will resolve the template bound to that connected account. Use the [Get Accounts](https://marketplace.gohighlevel.com/docs/ghl/social-planner/get-account) endpoint to look up account IDs.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location Id

### Request body (application/json)

**Body required**

- **templateId** `string` — Template ID to apply. Required if `accountId` is not provided.
- **accountId** `string` — Connected account ID — the endpoint will resolve the template bound to this account. Required if `templateId` is not provided. Use the [Get Accounts](https://marketplace.gohighlevel.com/docs/ghl/social-planner/apply-watermark-to-image/get-account) endpoint to look up account IDs.
- **inputMediaUrl** `string` _required_ — Input image URL to watermark
- **mimeType** `string` — MIME type of the input media
- **postId** `string` — Optional post ID to associate the watermark output with
- **watermarkId** `string` — Optional cache key to fetch a previously-generated watermark result
- **updatePost** `boolean` — Whether to update or create the linked post after watermarking

```json
{
  "templateId": "665f1bac78fda9b6c5f48012",
  "accountId": "665f1bac78fda9b6c5f48099",
  "inputMediaUrl": "http://example.com/media.png",
  "mimeType": "image/png",
  "postId": "ve9EPM428h8vShlRW1KT",
  "watermarkId": "ve9EPM428h8vShlRW1KT",
  "updatePost": false
}
```

### Response (200 · application/json)

Watermark processing initiated or cached result returned

**Schema**

- **success** `boolean` _required_ — Success or Failure
- **statusCode** `number` _required_ — Status Code
- **message** `string` _required_ — Message
- **results** `object` — Async processing state

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Watermark preview processing initiated.",
  "results": {
    "progressId": "abc123def456",
    "status": "pending",
    "message": "Watermark preview processing initiated.",
    "outputMediaUrl": "https://storage.googleapis.com/bucket/watermarked.png"
  }
}
```
