---
title: "List comments for a post or thread"
source: "https://marketplace.gohighlevel.com/docs/ghl/social-planner/get-comment-list"
seccion: "Social Planner > Comments > List comments for a post or thread"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/social-media-posting/comments/:platform/list"
---

# List comments for a post or thread

```http
POST /social-media-posting/comments/:platform/list
```

Paginated list of comments scoped to a post (`parentId` = postId) or a comment thread (`parentId` = commentId). Use `skip`/`limit` for pagination, `sortBy` for ordering, `originIds` to filter by connected account, and `search` for keyword search.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **platform** `string` _required_ — Supported Comments Platforms
  - Available options: `facebook`, `instagram`, `linkedin`, `community`, `tiktok`, `bluesky`, `youtube`, `threads`

### Query parameters

- **locationId** `string` _required_ — Location ID

### Request body (application/json)

**Body required**

- **fromDate** `string` — Start of the published-date window (ISO 8601). If provided, `toDate` is also required, and `fromDate` must be ≤ `toDate`. Omit both to disable date filtering.
- **toDate** `string` — End of the published-date window (ISO 8601). If provided, `fromDate` is also required.
- **originIds** `string[]` _required_ — Origin IDs of connected accounts to filter by
- **sortBy** `string` — Sort by top comments or latest comments
  - Available options: `top`, `latest`
- **search** `string` — Search
- **skip** `number` — Pagination offset — number of comments to skip (zero-based). Must be ≥ 0. **Possible values:** `>= 0`

  **Default value:**

  `0`

- **limit** `number` — Pagination page size — number of comments to return. Must be between 1 and 100. **Possible values:** `>= 1` and `<= 100`

  **Default value:**

  `10`

- **parentId** `string` — Parent ID — pass the Highlevel post ID (for replies under a specific post) or the Highlevel comment ID (for replies under a specific comment). Omit to list all top-level comments for the location filtered by `originIds`. Must be a valid 24-character Highlevel ID, not the native platform ID.

```json
{
  "fromDate": "2026-05-22T05:32:49.463Z",
  "toDate": "2026-05-29T05:32:49.463Z",
  "originIds": [
    "1234",
    "5678",
    "9101"
  ],
  "sortBy": "top",
  "search": "1234",
  "skip": 0,
  "limit": 10,
  "parentId": "6975b186f3442844ec07665b"
}
```

### Response (201 · application/json)

Successful response

**Schema**

- **success** `boolean` _required_ — Success or Failure
- **statusCode** `number` _required_ — Status Code
- **message** `string` _required_ — Message
- **results** `object` _required_ — Comments and pagination metadata

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Fetched Comments",
  "results": {
    "comments": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "platform": "facebook",
        "platformCommentId": "122129390871181019_974705035458625",
        "platformParentId": "956033194258752_122129390871181019",
        "platformPostId": "122129390871181019",
        "postId": "6a169db95c78177a5c24ef7c",
        "originId": "956033194258752",
        "isParentThread": true,
        "isPost": false,
        "content": "Nice post!",
        "attachments": [
          {
            "type": "image/jpeg",
            "url": "https://example.com/image.jpg",
            "thumbnail": "https://example.com/thumb.jpg",
            "videoUrl": "https://example.com/video.mp4"
          }
        ],
        "author": {
          "id": "123456789",
          "name": "John Doe",
          "profilePic": "https://example.com/avatar.jpg"
        },
        "level": 1,
        "likeCount": 0,
        "reactionCount": 0,
        "replyCount": 0,
        "shareCount": 0,
        "repostCount": 0,
        "quoteCount": 0,
        "previewLink": "https://www.facebook.com/.../posts/...",
        "isRead": false,
        "isDeleted": false,
        "isEdited": false,
        "publishedAt": "2026-04-01T10:00:00.000Z",
        "createdAt": "2026-04-01T10:00:00.000Z",
        "updatedAt": "2026-04-01T10:00:00.000Z"
      }
    ],
    "meta": {
      "total": 42,
      "totalUnread": 7,
      "skip": 0,
      "limit": 10,
      "hasMore": true
    }
  }
}
```
