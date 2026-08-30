---
title: "Update Custom Field Folder Name"
source: "https://marketplace.gohighlevel.com/docs/ghl/custom-fields/update-custom-field-folder"
seccion: "Custom Fields V2 > Custom Fields V2 > Update Custom Field Folder Name"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/custom-fields/folder/:id"
---

# Update Custom Field Folder Name

```http
PUT /custom-fields/folder/:id
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

### Request body (application/json)

**Body required**

- **name** `string` _required_ — Field name
- **locationId** `string` _required_ — Location Id

```json
{
  "name": "Name",
  "locationId": "ve9EPM428h8vShlRW1KT"
}
```

### Response (200 · application/json)

Successful response

**Schema**

- **id** `string` _required_ — Unique identifier of the object
- **objectKey** `string` _required_ — The key for your custom object. This key uniquely identifies the custom object. Example: "custom_object.pet" for a custom object related to pets.
- **locationId** `string` _required_ — Location Id
- **name** `string` _required_ — Field name

```json
{
  "id": "string",
  "objectKey": "custom_object.pet",
  "locationId": "ve9EPM428h8vShlRW1KT",
  "name": "Name"
}
```
