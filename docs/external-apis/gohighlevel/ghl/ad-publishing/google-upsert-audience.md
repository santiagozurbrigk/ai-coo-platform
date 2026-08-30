---
title: "Upsert audience"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-upsert-audience"
seccion: "Ad Manager > Google Ads > Upsert audience"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/ad-publishing/google/audiences"
---

# Upsert audience

```http
PUT /ad-publishing/google/audiences
```

Create or update a Google Ads combined audience

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **locationId** `string` _required_ — Location identifier
- **resourceName** `string` — Audience resource name
- **name** `string` _required_ — Audience name
- **dimensions** `object` — Audience dimensions
- **exclusionDimension** `object` — Exclusion dimensions

```json
{
  "locationId": "loc_abc123",
  "resourceName": "customers/123/audiences/456",
  "name": "My Audience",
  "dimensions": {
    "isAgeUnknown": false,
    "ageRanges": [
      {
        "minAge": 25,
        "maxAge": 34
      }
    ],
    "genders": [
      "MALE",
      "FEMALE"
    ]
  },
  "exclusionDimension": {
    "genders": [
      "UNDETERMINED"
    ]
  }
}
```

### Response (200 · application/json)

Google Ads mutate results for the created or updated audience — an array, not the audience itself

**Schema**

  Array [

  ]

```json
[
  {
    "resourceName": "customers/6776452901/conversionActions/7086809727"
  }
]
```
