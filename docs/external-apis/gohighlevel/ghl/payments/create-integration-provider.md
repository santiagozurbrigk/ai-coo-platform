---
title: "Create White-label Integration Provider"
source: "https://marketplace.gohighlevel.com/docs/ghl/payments/create-integration-provider"
seccion: "Payments > Integrations > Create White-label Integration Provider"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/payments/integrations/provider/whitelabel"
---

# Create White-label Integration Provider

```http
POST /payments/integrations/provider/whitelabel
```

The "Create White-label Integration Provider" API allows adding a new payment provider integration to the system which is built on top of Authorize.net or NMI. Use this endpoint to create a integration provider with the specified details. Ensure that the required information is provided in the request payload. This endpoint can be only invoked using marketplace-app token

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **altId** `string` _required_ — location Id / company Id based on altType
- **altType** `string` _required_ — Alt Type
  - Available options: `location`
- **uniqueName** `string` _required_ — A unique name given to the integration provider, uniqueName must start and end with a character. Only lowercase characters and hyphens (-) are supported
- **title** `string` _required_ — The title or name of the integration provider.
- **provider** `string` _required_ — The type of payment provider associated with the integration provider.
  - Available options: `authorize-net`, `nmi`
- **description** `string` _required_ — A brief description providing additional information about the integration provider.
- **imageUrl** `string` _required_ — The URL to an image representing the integration provider. The imageUrl should start with "https://" and ensure that this URL is publicly accessible.

```json
{
  "altId": "6578278e879ad2646715ba9c",
  "altType": "location",
  "uniqueName": "easy-direct",
  "title": "Title",
  "provider": {
    "AUTHORIZE_NET": "authorize-net",
    "NMI": "nmi"
  },
  "description": "Description",
  "imageUrl": "https://example.com/image.jpg"
}
```

### Response (200 · application/json)

Successful response

**Schema**

- **_id** `string` _required_ — The unique identifier of the integration provider.
- **altId** `string` _required_ — The altId / locationId of the integration provider.
- **altType** `string` _required_ — The altType of the integration provider.
- **title** `string` _required_ — The title or name of the integration provider.
- **route** `string` _required_ — The route name associated with the integration provider.
- **provider** `string` _required_ — The payment provider associated with the integration provider.
- **description** `string` _required_ — A brief description providing additional information about the integration provider.
- **imageUrl** `string` _required_ — The URL to an image representing the integration provider.
- **createdAt** `string<date-time>` _required_ — The timestamp when the integration provider was created.
- **updatedAt** `string<date-time>` _required_ — The timestamp when the integration provider was last updated.

```json
{
  "_id": "65cb47dda50f4f13ced4b870",
  "altId": "Z4Bxl8J4SaPEPLq9IQ8g",
  "altType": "location",
  "title": "Example",
  "route": "epd",
  "provider": "nmi",
  "description": "Lorem",
  "imageUrl": "https://example.com/assets/pmd/img/payments/nmi-logo.webp",
  "createdAt": "2024-02-13T10:43:41.026Z",
  "updatedAt": "2024-02-13T10:43:41.026Z"
}
```
