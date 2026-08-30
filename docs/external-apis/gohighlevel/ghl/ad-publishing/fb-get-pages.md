---
title: "Get Facebook pages"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-get-pages"
seccion: "Ad Manager > Facebook Integration > Get Facebook pages"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/ad-publishing/facebook/pages"
---

# Get Facebook pages

```http
GET /ad-publishing/facebook/pages
```

Retrieve Facebook pages for the connected account. Without `limit` the response is an array of pages (this array response will soon be deprecated — migrate to the paginated form). When `limit` is provided the response is a paginated `{ pages, paging }` envelope; pass `after` (from `paging.next`) to fetch the next batch.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location identifier
- **fetchExisting** `string` — Fetch existing pages flag
- **limit** `string` — Page size for a paginated fetch (fetchExisting only, max 50). When set, the response is a { pages, paging } envelope instead of an array.
- **after** `string` — Opaque cursor for the next batch, taken from the previous response paging.next

### Response (200 · application/json)

An array of pages (default; will soon be deprecated — use `limit` to get the paginated { pages, paging } response), or a { pages, paging } envelope when `limit` is provided

**Schema**

oneOf

Array [

- **id** `string` _required_ — Facebook Page ID
- **name** `string` _required_ — Page name
- **category** `string` — Page category
- **picture** `string` — Page profile picture URL
- **createdOn** `string` — When the page was connected to the location
- **isConnected** `boolean` _required_ — Whether the page is already connected to the location
- **tosAccepted** `boolean` — Whether the Facebook Lead Ads TOS is accepted for the page
- **isDefault** `boolean` — Whether this is the default connected page (only present when fetchExisting is false)

]

```json
[
  {
    "id": "1234567890",
    "name": "Acme Marketing",
    "category": "Marketing Agency",
    "picture": "https://scontent.xx.fbcdn.net/...",
    "createdOn": "2026-01-15T10:00:00.000Z",
    "isConnected": false,
    "tosAccepted": true,
    "isDefault": false
  }
]
```
