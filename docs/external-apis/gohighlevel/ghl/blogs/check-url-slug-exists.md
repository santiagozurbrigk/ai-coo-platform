---
title: "Check url slug"
source: "https://marketplace.gohighlevel.com/docs/ghl/blogs/check-url-slug-exists"
seccion: "Blogs > Blogs > Check url slug"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/blogs/posts/url-slug-exists"
---

# Check url slug

```http
GET /blogs/posts/url-slug-exists
```

The "Check url slug" API allows check the blog slug validation which is needed before publishing any blog post. Please use blogs/check-slug.readonly. you can find the POST ID from the post edit url.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **urlSlug** `string` _required_
- **locationId** `string` _required_
- **postId** `string`

### Response (200 · application/json)

Successful response

**Schema**

- **exists** `boolean` _required_ — Indicates whether the url slug exists or not

```json
{
  "exists": true
}
```
