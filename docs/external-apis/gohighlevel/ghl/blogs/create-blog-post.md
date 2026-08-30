---
title: "Create Blog Post"
source: "https://marketplace.gohighlevel.com/docs/ghl/blogs/create-blog-post"
seccion: "Blogs > Blogs > Create Blog Post"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/blogs/posts"
---

# Create Blog Post

```http
POST /blogs/posts
```

The "Create Blog Post" API allows you create blog post for any given blog site. Please use blogs/post.write

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **title** `string` _required_
- **locationId** `string` _required_
- **blogId** `string` _required_ — You can find the blog id from blog site dashboard link
- **imageUrl** `string` _required_
- **description** `string` _required_
- **rawHTML** `string` _required_
- **status** `string` _required_
  - Available options: `DRAFT`, `PUBLISHED`, `SCHEDULED`, `ARCHIVED`
- **imageAltText** `string` _required_
- **categories** `string[]` _required_ — This needs to be array of category ids, which you can get from the category get api call.
- **tags** `string[]`
- **author** `string` _required_ — This needs to be author id, which you can get from the author get api call.
- **urlSlug** `string` _required_
- **canonicalLink** `string`
- **publishedAt** `string` _required_ — Provide ISO timestamp

```json
{
  "title": "Your blog title",
  "locationId": "Location ID",
  "blogId": "Blog ID",
  "imageUrl": "Image URl",
  "description": "A short description",
  "rawHTML": "<h1>Your blog content</h1>",
  "status": "This can be PUBLISHED OR SCHEDULED OR ARCHIVED OR DRAFT",
  "imageAltText": "Alt text for your blog image",
  "categories": [
    "9c48df2694a849b6089f9d0d3513efe",
    "6683abde331c041f32c07aee"
  ],
  "tags": [
    "blog",
    "seo"
  ],
  "author": "6683abde331c041f32c07aea",
  "urlSlug": "any-blog-post-url",
  "canonicalLink": "https://tryghl.blog/post/testing-unsplash",
  "publishedAt": "2025-02-05T18:30:47.000Z"
}
```

### Response (200 · application/json)

Successful response

**Schema**

- **data** `object` _required_ — Object containing response data of blog post create.

```json
{
  "data": {
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
}
```
