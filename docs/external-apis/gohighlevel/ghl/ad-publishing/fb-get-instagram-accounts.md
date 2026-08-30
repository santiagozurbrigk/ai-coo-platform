---
title: "Get Instagram accounts for page"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-get-instagram-accounts"
seccion: "Ad Manager > Facebook Integration > Get Instagram accounts for page"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/ad-publishing/facebook/page/:pageId/instagram"
---

# Get Instagram accounts for page

```http
GET /ad-publishing/facebook/page/:pageId/instagram
```

Retrieve Instagram accounts linked to a specific Facebook page

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **pageId** `string` _required_ — Facebook page identifier

### Query parameters

- **locationId** `string` _required_ — Location identifier
- **type** `string` — Integration type
  - Available options: `INTEGRATION`, `AD_MANAGER`

### Response (200 · application/json)

Instagram accounts available as the ad identity for this page, merged from the Business Manager, the page-connected account, and the page-backed fallback. Check `typeOfAccount` before reading `name` or `picture` — they are not present on every entry.

**Schema**

  Array [

  ]

```json
[
  {
    "id": "17841471697713882",
    "name": "ad_manager_primary_insta",
    "picture": "https://scontent.xx.fbcdn.net/v/t51.2885-15/...",
    "typeOfAccount": "Page Connected Instagram Account"
  }
]
```
