---
title: "Delete Custom Field Folder"
source: "https://marketplace.gohighlevel.com/docs/ghl/custom-fields/delete-custom-field-folder"
seccion: "Custom Fields V2 > Custom Fields V2 > Delete Custom Field Folder"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/custom-fields/folder/:id"
---

# Delete Custom Field Folder

```http
DELETE /custom-fields/folder/:id
```

Create Custom Field Folder

> info
>
> Only supports Custom Objects and Company (Business) today. Will be extended to other Standard Objects in the future.
>

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **id** `string` _required_

### Query parameters

- **locationId** `string` _required_ — Location Id

### Response (200 · application/json)

Successful response

**Schema**

- **succeded** `boolean` _required_
- **id** `string` _required_
- **key** `string` _required_

```json
{
  "succeded": true,
  "id": "3v34PM428h8vShlRW1KT",
  "key": "custom_object.pet.name"
}
```
