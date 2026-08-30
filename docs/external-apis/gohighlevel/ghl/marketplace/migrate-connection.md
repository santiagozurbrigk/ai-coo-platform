---
title: "Migrate external authentication connection"
source: "https://marketplace.gohighlevel.com/docs/ghl/marketplace/migrate-connection"
seccion: "Developer marketplace > External Auth Migration > Migrate external authentication connection"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/marketplace/external-auth/migration"
---

# Migrate external authentication connection

```http
POST /marketplace/external-auth/migration
```

Migrates an external authentication connection credentials (basic or oauth2) for a specific app and location. This endpoint validates the app configuration, stores credentials safely in CRM's native encrypted storage. With this the lifecycle of the token is managed by CRM.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **type** `string` _required_ — Type of authentication - basic or oauth2
  - Available options: `oauth2`, `basic`
- **locationId** `string` _required_ — Location ID
- **appId** `string` _required_ — App ID
- **appVersionId** `string` _required_ — App Version ID
- **accountId** `string` _required_ — Connection identifier
- **apiKey** `string` — API Key (supported when type is basic)
- **basicCredentials** `object` — Basic auth credentials as key/value pairs (supported when type is basic). Keys are validated against the app version externalAuthConfig.fields.
- **accessToken** `string` — Access token (required when type is oauth2)
- **refreshToken** `string` — Refresh token (required when type is oauth2)
- **expiryIn** `number` — Access token expiry time in milliseconds (optional for oauth2)
- **expiryAt** `number` — Timestamp for access token expiry (optional for oauth2)
- **scopes** `string[]` — OAuth2 scopes (optional for oauth2)
- **displayName** `string` — Display name for the connection (optional, defaults to accountId)
- **isDefault** `boolean` — Whether this is the default connection for the location (optional, defaults to false)

```json
{
  "type": "oauth2",
  "locationId": "location_12345",
  "appId": "507f1f77bcf86cd799439011",
  "appVersionId": "507f1f77bcf86cd799439012",
  "accountId": "my-connection-identifier",
  "apiKey": "sk_test_1234567890",
  "basicCredentials": {
    "email": "[email protected]",
    "password": "p@ssw0rd"
  },
  "accessToken": "ya29.a0AfH6SMBx...",
  "refreshToken": "1//0gHq5F...",
  "expiryIn": 3600000,
  "expiryAt": 1735689600000,
  "scopes": [
    "contacts.readonly",
    "contacts.write"
  ],
  "displayName": "My Connection Display Name",
  "isDefault": false
}
```

### Response (201 · application/json)

Connection migrated successfully

**Schema**

- **success** `boolean` _required_ — Indicates if the migration was successful
- **identifier** `string` _required_ — Unique identifier for the migrated connection
- **message** `string` — Message describing the result

```json
{
  "success": true,
  "identifier": "migration_12345",
  "message": "Connection migrated successfully"
}
```
