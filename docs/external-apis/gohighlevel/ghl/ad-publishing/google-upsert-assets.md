---
title: "Upsert assets"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-upsert-assets"
seccion: "Ad Manager > Google Ads > Upsert assets"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/ad-publishing/google/assets"
---

# Upsert assets

```http
POST /ad-publishing/google/assets
```

Create or update Google Ads creative assets

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **locationId** `string` _required_ — Location identifier
- **type** `string` _required_ — Asset type to create or update
  - Available options: `CALL`, `SITELINK`
- **payload** `object` _required_ — Asset payload — shape depends on the type field: CallAssetPayload (CALL) or SitelinkAssetPayload (SITELINK)

```json
{
  "locationId": "loc_abc123",
  "type": "CALL",
  "payload": {
    "phoneNumber": "+14155551234",
    "countryCode": "US"
  }
}
```

### Response (200 · application/json)

Resource name of the created or updated asset

**Schema**

- **resourceName** `string` _required_ — Resource name of the created or updated record

```json
{
  "resourceName": "customers/6776452901/conversionActions/7142718149"
}
```
