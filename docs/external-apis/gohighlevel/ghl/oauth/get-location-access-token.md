---
title: "Get Location Access Token from Agency Token"
source: "https://marketplace.gohighlevel.com/docs/ghl/oauth/get-location-access-token"
seccion: "OAuth 2.0 > OAuth 2.0 > Get Location Access Token from Agency Token"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/oauth/location-token"
---

# Get Location Access Token from Agency Token

```http
POST /oauth/location-token
```

This API allows you to generate locationAccessToken from AgencyAccessToken

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/x-www-form-urlencoded)

**Body required**

- **companyId** `string` _required_ — Company Id of location you want to request token for
- **locationId** `string` _required_ — The location ID for which you want to obtain accessToken

```json
{
  "companyId": "tDtDnQdgm2LXpyiqYvZ6",
  "locationId": "l1C08ntBrFjLS0elLIYU"
}
```

### Response (200 · application/json)

Successful response

**Schema**

- **access_token** `string` — Location access token which can be used to authenticate & authorize API under following scope
- **token_type** `string` — The token type (always Bearer)
- **expires_in** `number` — Time in seconds remaining for token to expire
- **scope** `string` — Scopes the following accessToken have access to
- **locationId** `string` — Location ID - Present only for Sub-Account Access Token
- **planId** `string` — Plan Id of the subscribed plan in paid apps.
- **userId** `string` _required_ — USER ID - Represent user id of person who performed installation
- **appId** `string` — App ID of the installed application
- **versionId** `string` — Version ID of the installed app version
- **refresh_token** `string` — The OAuth2 refresh token used to obtain a new access token for this specific location.

```json
{
  "access_token": "ab12dc0ae1234a7898f9ff06d4f69gh",
  "token_type": "Bearer",
  "expires_in": 86399,
  "scope": "conversations/message.readonly conversations/message.write",
  "locationId": "l1C08ntBrFjLS0elLIYU",
  "planId": "l1C08ntBrFjLS0elLIYU",
  "userId": "l1C08ntBrFjLS0elLIYU",
  "appId": "6578278e879ad2646715ba9c",
  "versionId": "6578278e879ad2646715ba9c",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30"
}
```
