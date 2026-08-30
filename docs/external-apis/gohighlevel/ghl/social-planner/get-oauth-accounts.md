---
title: "Get Available Accounts (Step 2 of 3)"
source: "https://marketplace.gohighlevel.com/docs/ghl/social-planner/get-oauth-accounts"
seccion: "Social Planner > OAuth | Generic > Get Available Accounts (Step 2 of 3)"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/social-media-posting/oauth/:locationId/:platform/accounts/:accountId"
---

# Get Available Accounts (Step 2 of 3)

```http
GET /social-media-posting/oauth/:locationId/:platform/accounts/:accountId
```

## OAuth Connection Flow - Step 2: Get Available Accounts

After completing OAuth authentication (Step 1), use this endpoint to retrieve the list of available pages, channels, or locations that can be connected.

### OAuth Flow Position

1. **Start OAuth** → User authenticates, returns `accountId`

2. **Get Accounts** (this endpoint) → Lists available pages/channels to connect

3. **Attach Account** → Connect the selected account

### What This Returns

The response varies by platform:

| Platform | Returns |
| --- | --- |
| **facebook** | List of Facebook Pages the user manages |
| **instagram** | List of Instagram Professional Accounts (linked to Facebook Pages) |
| **google** | Google Business Profile locations |
| **linkedin** | LinkedIn Pages and Profile |
| **tiktok** | TikTok Creator account info |
| **tiktok-business** | TikTok Business Center accounts |
| **youtube** | YouTube Channels |
| **pinterest** | Pinterest Business accounts and boards |
| **threads** | Threads profiles |

### Next Step

From the response, select the account/page you want to connect and use its details in Step 3:

```text
POST /social-media-posting/oauth/{locationId}/{platform}/accounts/{accountId}
```

## Request

### Header parameters

- **Authorization** `string` _required_ — Access Token
- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Account Location Id
- **platform** `string` _required_ — Social media platform
  - Available options: `google`, `facebook`, `instagram`, `linkedin`, `tiktok`, `tiktok-business`, `youtube`, `pinterest`, `threads`, `bluesky`
- **accountId** `string` _required_ — The OAuth Account ID received from Step 1 (Start OAuth) via the window message event

### Query parameters

- **search** `string` — Search term to filter accounts/pages by name. Useful when the user has many pages to choose from.

### Response (200 · application/json)

Returns available accounts/pages/channels that can be connected. Response structure varies by platform - see examples below.

**Schema**

oneOf

- **success** `boolean` _required_ — Success or Failure
- **statusCode** `number` _required_ — Status Code
- **message** `string` _required_ — Message
- **results** `object` — Requested Results

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Fetched Facebook Account",
  "results": {
    "pages": [
      {
        "id": "u37swmmLbA02zgqKPpxITe2",
        "name": "FB Page",
        "avatar": "u37swmmLbA02zgqKPpxITe2",
        "isOwned": true,
        "isConnected": true
      }
    ]
  }
}
```

Facebook Pages Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Fetched Facebook Account",
  "results": {
    "pages": [
      {
        "id": "244405123411687",
        "name": "My Business Page",
        "avatar": "https://graph.facebook.com/244405123411687/picture",
        "isOwned": true,
        "isConnected": false
      },
      {
        "id": "567890123456789",
        "name": "Another Page",
        "avatar": "https://graph.facebook.com/567890123456789/picture",
        "isOwned": false,
        "isConnected": true
      }
    ]
  }
}
```

Instagram Professional Accounts Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Fetched Instagram Account",
  "results": {
    "accounts": [
      {
        "id": "17841405123456789",
        "name": "my_instagram_business",
        "avatar": "https://...",
        "isConnected": false,
        "pageId": "244405123411687",
        "isBusinessAccount": true
      }
    ]
  }
}
```

Google Business Profile Locations Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Fetched Google Business Account",
  "results": {
    "locations": {
      "location": {
        "name": "locations/12345678901234567890",
        "storeCode": "STORE001",
        "title": "My Business Location",
        "metadata": {
          "hasGoogleUpdated": true,
          "canDelete": true
        },
        "storefrontAddress": {
          "locality": "New York",
          "regionCode": "US"
        },
        "isVerified": true,
        "isConnected": false
      },
      "account": {
        "name": "accounts/123456789012345678",
        "accountName": "My Business Account",
        "type": "PERSONAL",
        "verificationState": "VERIFIED",
        "vettedState": "VETTED"
      }
    }
  }
}
```

LinkedIn Pages & Profile Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Fetched LinkedIn Account",
  "results": {
    "pages": [
      {
        "id": "urn:li:organization:12345678",
        "name": "My Company",
        "avatar": "https://...",
        "isConnected": false
      }
    ],
    "profile": {
      "id": "urn:li:person:AbCdEfGhIj",
      "name": "John Doe",
      "avatar": "https://..."
    }
  }
}
```

TikTok Creator Account Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Fetched TikTok Account",
  "results": {
    "openId": "7234567890123456789",
    "displayName": "My TikTok",
    "avatarUrl": "https://...",
    "isConnected": false
  }
}
```

YouTube Channels Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Fetched YouTube Account",
  "results": {
    "channels": [
      {
        "id": "UCabcdefghijklmnop",
        "name": "My YouTube Channel",
        "avatar": "https://...",
        "isConnected": false
      }
    ]
  }
}
```

Pinterest Account Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Fetched Pinterest Account",
  "results": {
    "id": "123456789012345678",
    "username": "mybusiness",
    "businessName": "My Pinterest Business",
    "avatar": "https://...",
    "isConnected": false
  }
}
```
