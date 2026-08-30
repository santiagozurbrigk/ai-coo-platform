---
title: "Upsert conversion"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-upsert-conversion"
seccion: "Ad Manager > Google Ads > Upsert conversion"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/ad-publishing/google/conversions"
---

# Upsert conversion

```http
PUT /ad-publishing/google/conversions
```

Create or update a Google Ads conversion action

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **locationId** `string` _required_ — Location identifier
- **conversionId** `string` — Conversion identifier
- **name** `string` _required_ — Conversion name
- **type** `string` _required_ — Conversion action type. Only `UPLOAD_CLICKS` is supported — the conversion list endpoint reads back UPLOAD_CLICKS actions only, so a conversion created with any other type would never be returned.
  - Available options: `UPLOAD_CLICKS`
- **category** `string` _required_ — Conversion action category
  - Available options: `DEFAULT`, `PAGE_VIEW`, `PURCHASE`, `SIGNUP`, `LEAD`, `DOWNLOAD`, `ADD_TO_CART`, `BEGIN_CHECKOUT`, `SUBSCRIBE_PAID`, `PHONE_CALL_LEAD`, `IMPORTED_LEAD`, `SUBMIT_LEAD_FORM`
- **valueSettings** `object` _required_ — Value settings that control how monetary value is attributed to conversions
- **countingType** `string` _required_ — How conversions are counted per interaction
  - Available options: `ONE_PER_CLICK`, `MANY_PER_CLICK`
- **attributionModel** `string` _required_ — Attribution model used to credit conversions
  - Available options: `GOOGLE_SEARCH_ATTRIBUTION_DATA_DRIVEN`, `GOOGLE_ADS_LAST_CLICK`
- **clickThroughWindow** `number` _required_ — Click-through conversion window in days

```json
{
  "locationId": "loc_abc123",
  "conversionId": "conv_456",
  "name": "Purchase Conversion",
  "type": "UPLOAD_CLICKS",
  "category": "PURCHASE",
  "valueSettings": {
    "defaultValue": "10.00",
    "defaultCurrencyCode": "USD",
    "alwaysUseDefaultValue": false
  },
  "countingType": "ONE_PER_CLICK",
  "attributionModel": "GOOGLE_ADS_LAST_CLICK",
  "clickThroughWindow": 30
}
```

### Response (200 · application/json)

Resource name of the created or updated conversion action

**Schema**

- **resourceName** `string` _required_ — Resource name of the created or updated record

```json
{
  "resourceName": "customers/6776452901/conversionActions/7142718149"
}
```
