---
title: "Get all categories"
source: "https://marketplace.gohighlevel.com/docs/ghl/blogs/get-all-categories-by-location"
seccion: "Blogs > Blogs > Get all categories"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/blogs/categories"
---

# Get all categories

```http
GET /blogs/categories
```

The "Get all categories" Api return the blog categoies for a given location ID. Please use "blogs/category.readonly"

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_
- **limit** `number` _required_ — Number of categories to show in the listing
- **offset** `number` _required_ — Number of categories to skip in listing

### Response (200 · application/json)

Successful response

**Schema**

- **categories** `object[]` _required_ — Array of categories

```json
{
  "categories": [
    {
      "_id": "lMOzIQZne5m6zQ528sT6",
      "label": "HighLevel",
      "locationId": "lMOzIQZne5m6zQ528sT6",
      "updatedAt": "2025-01-03T11:06:35.822Z",
      "canonicalLink": "https://tryghl.blog/doc/category/agency-growth",
      "urlSlug": "agency-growth"
    }
  ]
}
```
