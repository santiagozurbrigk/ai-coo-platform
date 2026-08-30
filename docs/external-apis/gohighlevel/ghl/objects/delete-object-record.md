---
title: "Delete Record"
source: "https://marketplace.gohighlevel.com/docs/ghl/objects/delete-object-record"
seccion: "Objects > Records > Delete Record"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/objects/:schemaKey/records/:id"
---

# Delete Record

```http
DELETE /objects/:schemaKey/records/:id
```

Delete Record By Id . Supported Objects are business and custom objects.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **schemaKey** `string` _required_ — The key of the Custom Object / Standard Object Schema. For custom objects, the key must include the “custom_objects.” prefix, while standard objects use their respective object keys. This information is available on the Custom Objects Details page under Settings.
- **id** `string` _required_ — id of the record to be updated. Available on the Record details page under the 3 dots or in the url

### Response (200 · application/json)

Successful response

**Schema**

- **id** `string` — id of the deleted object
- **success** `boolean` — boolean that defines if the operation was a success or not

```json
{
  "id": "661c06b4ffde146bdb469442",
  "success": true
}
```
