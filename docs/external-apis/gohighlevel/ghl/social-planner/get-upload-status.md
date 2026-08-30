---
title: "Get Upload Status"
source: "https://marketplace.gohighlevel.com/docs/ghl/social-planner/get-upload-status"
seccion: "Social Planner > CSV > Get Upload Status"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/social-media-posting/:locationId/csv"
---

# Get Upload Status

```http
GET /social-media-posting/:locationId/csv
```

Get the status of all CSV imports for a location

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location Id

### Query parameters

- **skip** `string` — Number of records to skip

  Default value:

  `0`

- **limit** `string` — Maximum number of records to return

  Default value:

  `10`

- **includeUsers** `string` — Include user data in response
- **isFromTemplate** `string` — Filter CSVs imported from template library
- **userId** `string` _required_ — User ID

### Response (200 · application/json)

Successful response

**Schema**

- **success** `boolean` _required_ — Success or Failure
- **statusCode** `number` _required_ — Status Code
- **message** `string` _required_ — Message
- **results** `object` — Requested Results

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Fetched CSV Upload Status",
  "results": {
    "csvs": [
      {
        "id": "ve9EPM428h8vShlRW1KT",
        "locationId": "iVrVJ2uoXNF0wzcBzgl5",
        "fileName": "sample.csv",
        "status": "completed",
        "count": 5
      }
    ],
    "count": 6
  }
}
```
