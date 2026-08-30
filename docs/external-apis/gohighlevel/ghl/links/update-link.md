---
title: "Update Link"
source: "https://marketplace.gohighlevel.com/docs/ghl/links/update-link"
seccion: "Trigger Links > Trigger Links > Update Link"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/links/:linkId"
---

# Update Link

```http
PUT /links/:linkId
```

Update Link

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **linkId** `string` _required_ — Link Id

### Request body (application/json)

**Body required**

- **name** `string` _required_ — Display name of the trigger link
- **redirectTo** `string` _required_ — URL or variable to redirect to when the trigger link is clicked

```json
{
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
