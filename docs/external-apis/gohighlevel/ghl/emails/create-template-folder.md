---
title: "Create a template folder"
source: "https://marketplace.gohighlevel.com/docs/ghl/emails/create-template-folder"
seccion: "Email > Templates > Create a template folder"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/emails/locations/:locationId/templates/folders"
---

# Create a template folder

```http
POST /emails/locations/:locationId/templates/folders
```

Create a new template folder

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location ID

### Request body (application/json)

**Body required**

- **name** `string` _required_ — Folder name
- **userId** `string` — ID of the user performing this action

```json
{
  "name": "Spring Campaigns",
  "userId": "507f1f77bcf86cd799439011"
}
```

### Response (201 · application/json)

Success

**Schema**

- **id** `string` _required_ — Folder ID
- **name** `string` _required_ — Folder name
- **createdAt** `string` — Created timestamp
- **updatedAt** `string` — Updated timestamp
- **traceId** `string` — Trace ID of request

```json
{
  "id": "67f15c2ae99226d5bcccb8f3",
  "name": "Spring Campaigns",
  "createdAt": "2025-07-24T11:55:43.598Z",
  "updatedAt": "2025-07-24T11:55:43.598Z",
  "traceId": "019e4ef5-a65e-4198-8cf9-8e93dca9bda4"
}
```
