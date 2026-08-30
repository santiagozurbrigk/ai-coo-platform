---
title: "Get posts"
source: "https://marketplace.gohighlevel.com/docs/ghl/social-planner/get-posts"
seccion: "Social Planner > Post > Get posts"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/social-media-posting/:locationId/posts/list"
---

# Get posts

```http
POST /social-media-posting/:locationId/posts/list
```

Get Posts

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location Id

### Request body (application/json)

**Body required**

- **type** `string` — type must be one of the following values: recent, all, scheduled, draft, failed, in_review, published, in_progress, pending and deleted

  **Default value:**

  `all`

- **accounts** `string` — List of account Ids separated by comma as a string
- **skip** `string` _required_ — Number of records to skip for pagination

  **Default value:**

  `0`

- **limit** `string` _required_ — Maximum number of records to return

  **Default value:**

  `10`

- **fromDate** `string` _required_ — From Date
- **toDate** `string` _required_ — To Date
- **includeUsers** `string` _required_ — Include User Data
- **postType** `object` — Post Type must be one of the following values: - post, story, reel

```json
{
  "type": "all",
  "accounts": "660a83fc29deacac50033e2b_omaDY3RbWtTP511e808O_17841465964543589, 38bF83fc29deacac50033e2b_omaDY3RbWtr3P11e808O_17841465964543998",
  "skip": "0",
  "limit": "10",
  "fromDate": "2024-01-22T05:32:49.463Z",
  "toDate": "2024-03-20T05:32:49.463Z",
  "includeUsers": "true",
  "postType": "post"
}
```

### Response (201 · application/json)

Successful response

**Schema**

- **success** `boolean` _required_ — Success or Failure
- **statusCode** `number` _required_ — Status Code
- **message** `string` _required_ — Message
- **results** `object` — Requested Results

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Fetched Posts",
  "results": {
    "posts": [
      {
        "_id": "61bb16833b3f2791f9715be2",
        "locationId": "ve9EPM428h8vShlRW1KT",
        "status": "published",
        "insights": {
          "like": 12,
          "share": 3,
          "comment": 5
        }
      }
    ],
    "count": 6
  }
}
```
