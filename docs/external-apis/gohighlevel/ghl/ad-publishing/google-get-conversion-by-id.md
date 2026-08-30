---
title: "Get conversion by ID"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-get-conversion-by-id"
seccion: "Ad Manager > Google Ads > Get conversion by ID"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/ad-publishing/google/conversions/:conversionId"
---

# Get conversion by ID

```http
GET /ad-publishing/google/conversions/:conversionId
```

Retrieve a specific Google Ads conversion action by ID

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **conversionId** `string` _required_ — Conversion identifier

### Query parameters

- **locationId** `string` _required_ — Location identifier

### Response (200 · application/json)

The conversion action, including removed ones

**Schema**

- **id** `string` _required_ — Google Ads conversion action id
- **resourceName** `string` _required_ — Google Ads resource name
- **name** `string` _required_ — Conversion action name
- **status** `string` _required_ — Conversion action status. `REMOVED` actions are still readable by id.
- **type** `string` _required_ — Conversion action type
  - Available options: `UPLOAD_CLICKS`, `UPLOAD_CALLS`, `WEBPAGE`, `LEAD_FORM_SUBMIT`
- **category** `string` _required_ — Conversion action category
  - Available options: `DEFAULT`, `PAGE_VIEW`, `PURCHASE`, `SIGNUP`, `LEAD`, `DOWNLOAD`, `ADD_TO_CART`, `BEGIN_CHECKOUT`, `SUBSCRIBE_PAID`, `PHONE_CALL_LEAD`, `IMPORTED_LEAD`, `SUBMIT_LEAD_FORM`
- **valueSettings** `object` _required_ — Value configuration
- **countingType** `string` _required_ — How conversions are counted per click
  - Available options: `ONE_PER_CLICK`, `MANY_PER_CLICK`
- **attributionModelSettings** `object` _required_ — Attribution configuration
- **includeInConversionsMetric** `boolean` _required_ — Whether this action feeds the Conversions reporting metric
- **clickThroughLookbackWindowDays** `string` _required_ — Click-through lookback window in days, returned as a string
- **viewThroughLookbackWindowDays** `string` _required_ — View-through lookback window in days, returned as a string

```json
{
  "id": "7142742902",
  "resourceName": "customers/6776452901/conversionActions/7142742902",
  "name": "Offline purchase",
  "status": "ENABLED",
  "type": "UPLOAD_CLICKS",
  "category": "PURCHASE",
  "valueSettings": {
    "defaultValue": 0,
    "defaultCurrencyCode": "XXX",
    "alwaysUseDefaultValue": true
  },
  "countingType": "MANY_PER_CLICK",
  "attributionModelSettings": {
    "attributionModel": "GOOGLE_SEARCH_ATTRIBUTION_DATA_DRIVEN"
  },
  "includeInConversionsMetric": true,
  "clickThroughLookbackWindowDays": "90",
  "viewThroughLookbackWindowDays": "1"
}
```
