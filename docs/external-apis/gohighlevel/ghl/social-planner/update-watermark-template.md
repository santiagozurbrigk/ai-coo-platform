---
title: "Update a watermark template by ID"
source: "https://marketplace.gohighlevel.com/docs/ghl/social-planner/update-watermark-template"
seccion: "Social Planner > Watermarks > Update a watermark template by ID"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/social-media-posting/:locationId/watermarks/:templateId"
---

# Update a watermark template by ID

```http
PUT /social-media-posting/:locationId/watermarks/:templateId
```

Update the config on an existing watermark template — image URL, position, scale, opacity, padding, template name, or the connected accounts it applies to. Updating `accountIds` re-binds the template to a different set of accounts; use the [Get Accounts](https://marketplace.gohighlevel.com/docs/ghl/social-planner/get-account) endpoint to look up account IDs.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location Id
- **templateId** `string` _required_ — Watermark template ID

### Request body (application/json)

**Body required**

- **position** `string` — Watermark position on the target image
  - Available options: `top-left`, `top-center`, `top-right`, `left-center`, `center`, `right-center`, `bottom-left`, `bottom-center`, `bottom-right`
- **scale** `number` — Scale factor between 0 and 1
- **opacity** `number` — Opacity between 0 and 1
- **padding** `boolean` — Whether padding is applied around the watermark
- **templateName** `string` — Name of the watermark template
- **accountIds** `string[]` — Connected account IDs to re-bind this template to. Sending this replaces the current binding entirely. Use the [Get Accounts](https://marketplace.gohighlevel.com/docs/ghl/social-planner/update-watermark-template/get-account) endpoint to look up account IDs.
- **deleted** `boolean` — Set true to soft-delete this template

```json
{
  "position": "top-left",
  "scale": 0.5,
  "opacity": 0.7,
  "padding": true,
  "templateName": "DefaultTemplate",
  "accountIds": [
    "507f1f77bcf86cd799439011",
    "507f1f77bcf86cd799439012"
  ],
  "deleted": false
}
```

### Response (200 · application/json)

Watermark template successfully updated

**Schema**

- **success** `boolean` _required_ — Success or Failure
- **statusCode** `number` _required_ — Status Code
- **message** `string` _required_ — Message
- **results** `object` — Watermark template

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Fetched Watermark Template",
  "results": {
    "_id": "665f1bac78fda9b6c5f48012",
    "watermarkImageUrl": "http://example.com/watermark.png",
    "position": "top-left",
    "scale": 0.5,
    "opacity": 0.7,
    "padding": true,
    "templateName": "DefaultTemplate",
    "locationId": "ve9EPM428h8vShlRW1KT",
    "createdBy": "Lx1EI6YIgQYMQi0ytFXv",
    "accountIds": [
      "507f1f77bcf86cd799439011",
      "507f1f77bcf86cd799439012"
    ],
    "deleted": false,
    "createdAt": "2024-07-24T10:21:00.123Z",
    "updatedAt": "2024-07-24T10:21:00.123Z"
  }
}
```
