---
title: "Fetch list of funnel pages"
source: "https://marketplace.gohighlevel.com/docs/ghl/funnels/get-pages-by-funnel-id"
seccion: "Funnels > Funnel > Fetch list of funnel pages"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/funnels/page"
---

# Fetch list of funnel pages

```http
GET /funnels/page
```

Retrieves a list of all funnel pages based on the given query parameters.

## Request

### Query parameters

- **locationId** `string` _required_
- **funnelId** `string` _required_
- **name** `string`
- **limit** `number` _required_
- **offset** `number` _required_

### Response (200 · application/json)

Successful response - List of funnel pages returned

**Schema**

- **_id** `string` _required_
- **locationId** `string` _required_
- **funnelId** `string` _required_
- **name** `string` _required_
- **stepId** `string` _required_
- **deleted** `string` _required_
- **updatedAt** `string` _required_

```json
{
  "_id": "0yJbP3q7t7pLmeTWRAE2",
  "locationId": "ojQjykmwNIU88vfsfzvH",
  "funnelId": "iucJ6TdFZiddhq9f6znh",
  "name": "Home",
  "stepId": "343bf634-3aa6-4ade-b963-2d3cd0bf2ede",
  "deleted": false,
  "updatedAt": "2024-04-18T12:25:23.029Z"
}
```
