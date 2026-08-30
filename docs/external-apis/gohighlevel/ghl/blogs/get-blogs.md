---
title: "Get Blogs by Location ID"
source: "https://marketplace.gohighlevel.com/docs/ghl/blogs/get-blogs"
seccion: "Blogs > Blogs > Get Blogs by Location ID"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/blogs/site/all"
---

# Get Blogs by Location ID

```http
GET /blogs/site/all
```

The "Get Blogs by Location ID" API allows you get blogs using Location ID.Please use blogs/list.readonly

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_
- **skip** `number` _required_
- **limit** `number` _required_
- **searchTerm** `string` — search for any post by name

### Response (200 · application/json)

Successful response

**Schema**

- **data** `object[]` _required_ — Object containing response data of blog

```json
{
  "data": [
    {
      "_id": "lMOzIQZne5m6zQ528sT6",
      "name": "My blog"
    }
  ]
}
```
