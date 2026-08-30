---
title: "Create Link"
source: "https://marketplace.gohighlevel.com/docs/ghl/links/create-link"
seccion: "Trigger Links > Trigger Links > Create Link"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/links/"
---

# Create Link

```http
POST /links/
```

Create Link

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **locationId** `string` _required_ — Location ID of the business profile
- **name** `string` _required_ — Display name of the trigger link
- **redirectTo** `string` _required_ — URL or variable to redirect to when the trigger link is clicked

```json
{
  "locationId": "ve9EPM428h8vShlRW1KT",
  "name": "first tag",
  "redirectTo": "https://www.google.com/"
}
```

### Response (201 · application/json)

Successful response

**Schema**

- **link** `object` — The trigger link object

```json
{
  "link": {
    "id": "n4AriwEnFrGh3tu08W0U",
    "name": "first tag",
    "redirectTo": "https://www.google.com/",
    "fieldKey": "{{trigger_link.n4AriwEnFrGh3tu08W0U}}",
    "locationId": "ve9EPM428h8vShlRW1KT"
  }
}
```
