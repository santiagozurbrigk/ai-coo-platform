---
title: "Get all authors"
source: "https://marketplace.gohighlevel.com/docs/ghl/blogs/get-all-blog-authors-by-location"
seccion: "Blogs > Blogs > Get all authors"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/blogs/authors"
---

# Get all authors

```http
GET /blogs/authors
```

The "Get all authors" Api return the blog authors for a given location ID. Please use "blogs/author.readonly"

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location Id
- **limit** `number` _required_ — Number of authors to show in the listing
- **offset** `number` _required_ — Number of authors to skip in listing

### Response (200 · application/json)

Successful response

**Schema**

- **authors** `object[]` _required_ — Array of authors

```json
{
  "authors": [
    {
      "_id": "lMOzIQZne5m6zQ528sT6",
      "name": "HighLevel",
      "locationId": "lMOzIQZne5m6zQ528sT6",
      "updatedAt": "2025-01-03T11:06:35.822Z",
      "canonicalLink": "https://tryghl.blog/post/technology"
    }
  ]
}
```
