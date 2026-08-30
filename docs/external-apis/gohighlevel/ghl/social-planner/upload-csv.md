---
title: "Upload CSV"
source: "https://marketplace.gohighlevel.com/docs/ghl/social-planner/upload-csv"
seccion: "Social Planner > CSV > Upload CSV"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/social-media-posting/:locationId/csv"
---

# Upload CSV

```http
POST /social-media-posting/:locationId/csv
```

Upload a CSV file containing social media posts for bulk scheduling

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location Id

### Request body (multipart/form-data)

**Body required**

- **file** `string<binary>` _required_ — CSV file to upload containing social media posts

```json
{
  "file": "sample.csv"
}
```

### Response (201 · application/json)

Successful response

**Schema**

- **success** `boolean` _required_ — Success or Failure
- **statusCode** `number` _required_ — Status Code
- **message** `string` _required_ — Message
- **results** `object` — Requested Results

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Uploaded CSV",
  "results": {
    "filePath": "omaDY3RbWtTP511e/social-import/d23d68c2-82c0-1db6e2.csv",
    "rowsCount": 6,
    "fileName": "sample.csv",
    "fileSize": 1024,
    "csvFileType": "basic"
  }
}
```
