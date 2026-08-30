---
title: "Create a watermark template"
source: "https://marketplace.gohighlevel.com/docs/ghl/social-planner/create-watermark-template"
seccion: "Social Planner > Watermarks > Create a watermark template"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/social-media-posting/:locationId/watermarks"
---

# Create a watermark template

```http
POST /social-media-posting/:locationId/watermarks
```

Create a new reusable watermark template for a location. The template stores the watermark image URL, position, scale, opacity, padding, and the connected accounts it applies to.

At post-publish time, the template is resolved for a given connected account via the `accountIds` binding — the `accountId` you provide here maps a connected social account to this template. To fetch account IDs, use the [Get Accounts](https://marketplace.gohighlevel.com/docs/ghl/social-planner/get-account) endpoint.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location Id

### Request body (application/json)

**Body required**

- **watermarkImageUrl** `string` _required_ — URL of the watermark image. Must be a PNG or JPG file, minimum 200x200 pixels, and no larger than 5 MB.
- **position** `string` _required_ — Watermark position on the target image
  - Available options: `top-left`, `top-center`, `top-right`, `left-center`, `center`, `right-center`, `bottom-left`, `bottom-center`, `bottom-right`
- **scale** `number` _required_ — Scale factor between 0 and 1
- **opacity** `number` _required_ — Opacity between 0 and 1
- **padding** `boolean` _required_ — Whether padding is applied around the watermark
- **templateName** `string` _required_ — Name of the watermark template
- **accountIds** `string[]` _required_ — Connected account IDs to bind this template to. These IDs map user accounts to this template at post-publish time. Use the [Get Accounts](https://marketplace.gohighlevel.com/docs/ghl/social-planner/create-watermark-template/get-account) endpoint to look up account IDs.

```json
{
  "watermarkImageUrl": "http://example.com/watermark.png",
  "position": "top-left",
  "scale": 0.5,
  "opacity": 0.7,
  "padding": true,
  "templateName": "DefaultTemplate",
  "accountIds": [
    "507f1f77bcf86cd799439011",
    "507f1f77bcf86cd799439012"
  ]
}
```

### Response (201 · application/json)

Watermark template successfully created.

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
