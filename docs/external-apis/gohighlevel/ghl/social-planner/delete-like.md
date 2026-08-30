---
title: "Unlike a comment"
source: "https://marketplace.gohighlevel.com/docs/ghl/social-planner/delete-like"
seccion: "Social Planner > Comments > Unlike a comment"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/social-media-posting/comments/:platform/:id/like"
---

# Unlike a comment

```http
DELETE /social-media-posting/comments/:platform/:id/like
```

Remove a like from a comment by its **Highlevel** comment ID (the `_id` returned by the list-comments endpoint — not the native platform ID).

Works for any comment level — top-level comments, replies, and replies-to-replies. **Supported platforms:** Facebook, LinkedIn, Community, TikTok, Bluesky. Instagram is not supported (passing `instagram` returns 400).

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **platform** `string` _required_ — Platform that supports liking / unliking comments (Instagram is not supported)
  - Available options: `facebook`, `linkedin`, `community`, `tiktok`, `bluesky`
- **id** `string` _required_ — Highlevel comment ID — the `_id` returned by the list-comments endpoint (`POST /comments/{platform}/list`). Not the native platform comment ID. Works for any comment level: top-level comments, replies, and replies-to-replies.

### Query parameters

- **locationId** `string` _required_ — Location ID

### Response (200 · application/json)

Successful response

**Schema**

- **success** `boolean` _required_ — Success or Failure
- **statusCode** `number` _required_ — Status Code
- **message** `string` _required_ — Message

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Deleted Like"
}
```
