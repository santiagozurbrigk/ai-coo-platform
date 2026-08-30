---
title: "Get Access Token"
source: "https://marketplace.gohighlevel.com/docs/ghl/oauth/get-access-token"
seccion: "OAuth 2.0 > OAuth 2.0 > Get Access Token"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/oauth/token"
---

# Get Access Token

```http
POST /oauth/token
```

Use Access Tokens to access CRM resources on behalf of an authenticated location/company.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/x-www-form-urlencoded)

**Body required**

- **client_id** `string` _required_ — The ID provided by CRM for your integration
- **client_secret** `string` _required_ — The client secret provided by CRM for your integration
- **grant_type** `string` _required_ — The OAuth2 grant type — authorization_code, refresh_token, or client_credentials
  - Available options: `authorization_code`, `refresh_token`, `client_credentials`
- **code** `string` — The authorization code received from the authorization endpoint (required for authorization_code grant)
- **refresh_token** `string` — The refresh token used to obtain a new access token (required for refresh_token grant)
- **user_type** `string` — The type of token to be requested
  - Available options: `Company`, `Location`
- **redirect_uri** `string` — The redirect URI for your application

```json
{
  "client_id": "6578278e879ad2646715ba9c",
  "client_secret": "ab12dc0ae1234a7898f9ff06d4f69gh",
  "grant_type": "authorization_code",
  "code": "ab12dc0ae1234a7898f9ff06d4f69gh",
  "refresh_token": "xy34dc0ae1234a4858f9ff06d4f66ba",
  "user_type": "Location",
  "redirect_uri": "https://myapp.com/oauth/callback/crm"
}
```

### Response (200 · application/json)

Successful response

**Schema**

- **access_token** `string` — The OAuth2 access token
- **token_type** `string` — The token type (always Bearer)
- **expires_in** `number` — Time in seconds until the access token expires
- **refresh_token** `string` — The OAuth2 refresh token used to obtain a new access token
- **scope** `string` — Space-separated list of scopes the access token has access to
- **userType** `string` — The user type associated with the token (Location or Company)
- **locationId** `string` — Location ID - Present only for Sub-Account Access Token
- **companyId** `string` — Company ID
- **approvedLocations** `string[]` — Approved locations to generate location access token
- **userId** `string` _required_ — USER ID - Represent user id of person who performed installation
- **planId** `string` — Plan Id of the subscribed plan in paid apps.
- **isBulkInstallation** `boolean` — Indicates whether the installation was performed as a bulk installation
- **installToFutureLocations** `boolean` — Boolean to control if user wants app to be automatically installed to future locations (only for company tokens)
- **approveAllLocations** `boolean` — Boolean indicating if user approved all locations during bulk installation (only for company tokens)

```json
{
  "access_token": "ab12dc0ae1234a7898f9ff06d4f69gh",
  "token_type": "Bearer",
  "expires_in": 86399,
  "refresh_token": "xy34dc0ae1234a4858f9ff06d4f66ba",
  "scope": "conversations/message.readonly conversations/message.write",
  "userType": "Location",
  "locationId": "l1C08ntBrFjLS0elLIYU",
  "companyId": "l1C08ntBrFjLS0elLIYU",
  "approvedLocations": [
    "l1C08ntBrFjLS0elLIYU"
  ],
  "userId": "l1C08ntBrFjLS0elLIYU",
  "planId": "l1C08ntBrFjLS0elLIYU",
  "isBulkInstallation": false,
  "installToFutureLocations": true,
  "approveAllLocations": true
}
```
