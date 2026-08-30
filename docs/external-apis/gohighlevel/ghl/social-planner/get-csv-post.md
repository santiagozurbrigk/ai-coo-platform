---
title: "Get CSV Post"
source: "https://marketplace.gohighlevel.com/docs/ghl/social-planner/get-csv-post"
seccion: "Social Planner > CSV > Get CSV Post"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/social-media-posting/:locationId/csv/:id"
---

# Get CSV Post

```http
GET /social-media-posting/:locationId/csv/:id
```

Get details of a specific CSV import including its posts

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location Id
- **id** `string` _required_ — CSV Id

### Query parameters

- **skip** `string` — Number of records to skip
- **limit** `string` — Maximum number of records to return

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
  "message": "Fetched CSV Post",
  "results": {
    "csv": {
      "id": "ve9EPM428h8vShlRW1KT",
      "locationId": "iVrVJ2uoXNF0wzcBzgl5",
      "fileName": "sample.csv",
      "status": "completed",
      "count": 5
    },
    "count": 6,
    "posts": [
      {
        "accountIds": [
          "aF3KhyL8JIuBwzK3m7Ly_iVrVJ2uoXNF0wzcBzgl5_12554616564525983496"
        ],
        "summary": "First post",
        "type": "post"
      }
    ]
  }
}
```
