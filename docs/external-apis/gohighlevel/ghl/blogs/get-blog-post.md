---
title: "Get Blog posts by Blog ID"
source: "https://marketplace.gohighlevel.com/docs/ghl/blogs/get-blog-post"
seccion: "Blogs > Blogs > Get Blog posts by Blog ID"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/blogs/posts/all"
---

# Get Blog posts by Blog ID

```http
GET /blogs/posts/all
```

The "Get Blog posts by Blog ID" API allows you get blog posts for any given blog site using blog ID.Please use blogs/posts.readonly

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_
- **blogId** `string` _required_
- **limit** `number` _required_
- **offset** `number` _required_
- **searchTerm** `string` — search for any post by name
- **status** `string`
  - Available options: `ALL`, `PUBLISHED`, `SCHEDULED`, `ARCHIVED`, `DRAFT`

### Response (200 · application/json)

Successful response

**Schema**

- **blogs** `object[]` _required_ — Object containing response data of blog posts

```json
{
  "blogs": [
    {
      "categories": [
        "659ecabc4a37969a2b7cc370",
        "6683abde331c041f32c07aee"
      ],
      "tags": [
        "Apple",
        "Banana"
      ],
      "archived": false,
      "_id": "66c381b38be80858b9af62b6",
      "title": "Banana is good source of energy",
      "description": "Description",
      "imageUrl": "https://storage.googleapis.com/ghl-test/fACm0Ojm5oC70G3DcFmE/media/66b5aa3b1745b2713a8d033f.jpeg",
      "status": "PUBLISHED",
      "imageAltText": "alt",
      "urlSlug": "banana-good-energy",
      "canonicalLink": "https://blog.chatgpts.agency/post/test-8384",
      "author": "659ec9634a3796e4e47cc360",
      "publishedAt": "2024-08-19T17:14:57.000Z",
      "updatedAt": "2024-08-19T17:32:36.182Z"
    }
  ]
}
```
