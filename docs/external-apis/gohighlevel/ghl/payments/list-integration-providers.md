---
title: "List White-label Integration Providers"
source: "https://marketplace.gohighlevel.com/docs/ghl/payments/list-integration-providers"
seccion: "Payments > Integrations > List White-label Integration Providers"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/payments/integrations/provider/whitelabel"
---

# List White-label Integration Providers

```http
GET /payments/integrations/provider/whitelabel
```

The "List White-label Integration Providers" API allows to retrieve a paginated list of integration providers. Customize your results by filtering whitelabel integration providers(which are built directly on top of Authorize.net or NMI) based on name or paginate through the list using the provided query parameters. This endpoint provides a straightforward way to explore and retrieve integration provider information.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **altId** `string` _required_ — location Id / company Id based on altType
- **altType** `string` _required_ — Alt Type
  - Available options: `location`
- **limit** `number` — The maximum number of items to be included in a single page of results

  Default value:

  `0`

- **offset** `number` — The starting index of the page, indicating the position from which the results should be retrieved.

  Default value:

  `0`

### Response (200 · application/json)

Successful response

**Schema**

- **providers** `object` _required_ — list of integration provider.

```json
{
  "providers": {
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
}
```
