---
title: "Get post"
source: "https://marketplace.gohighlevel.com/docs/ghl/social-planner/get-post"
seccion: "Social Planner > Post > Get post"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/social-media-posting/:locationId/posts/:id"
---

# Get post

```http
GET /social-media-posting/:locationId/posts/:id
```

Get post

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location Id
- **id** `string` _required_ — Post Id

### Response (200 · application/json)

Successful response

**Schema**

- **success** `boolean` _required_ — Success or Failure
- **statusCode** `number` _required_ — Status Code
- **message** `string` _required_ — Message
- **results** `object` — Requested Results

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Fetched Post",
  "results": {
    "post": {
      "_id": "61bb16833b3f2791f9715be2",
      "locationId": "ve9EPM428h8vShlRW1KT",
      "status": "published",
      "insights": {
        "like": 12,
        "share": 3,
        "comment": 5
      }
    }
  }
}
```
