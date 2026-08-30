---
title: "Uploads File to customFields"
source: "https://marketplace.gohighlevel.com/docs/ghl/locations/upload-file-custom-fields"
seccion: "Sub-Account (Formerly location) > Custom Field > Uploads File to customFields"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/locations/:locationId/customFields/upload"
---

# Uploads File to customFields

```http
POST /locations/:locationId/customFields/upload
```

Uploads File to customFields

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_

### Request body (multipart/form-data)

**Body required**

- **id** `string` — Id(Contact Id/Opportunity Id/Custom Field Id)
- **maxFiles** `string` — Max number of files

```json
{
  "id": "aWdODOBVOlH1RUFKWQke",
  "maxFiles": "15"
}
```

### Response (200 · application/json)

Successful response

**Schema**

- **uploadedFiles** `object` — Uploaded files
- **meta** `string[]` — Meta data of uploaded files

```json
{
  "uploadedFiles": {
    "FileName.csv": "https://highlevel-private-staging.storage.googleapis.com/location/Ar4JQgIyuzRsVuwD9RSK/custom-Field/UpZLmohmKEQYn0ymqplY/56e0d7fc-085c-4a07-9e1d-6d8fdac7e710.csv"
  },
  "meta": [
    {
      "fieldname": "FileName.csv",
      "originalname": "FileName.csv",
      "encoding": "7bit",
      "mimetype": "text/csv",
      "size": 2061,
      "url": "https://highlevel-private-staging.storage.googleapis.com/location/Ar4JQgIyuzRsVuwD9RSK/custom-Field/UpZLmohmKEQYn0ymqplY/56e0d7fc-085c-4a07-9e1d-6d8fdac7e710.csv"
    }
  ]
}
```
