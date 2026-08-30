---
title: "Update Custom Field By Id"
source: "https://marketplace.gohighlevel.com/docs/ghl/custom-fields/update-custom-field"
seccion: "Custom Fields V2 > Custom Fields V2 > Update Custom Field By Id"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/custom-fields/:id"
---

# Update Custom Field By Id

```http
PUT /custom-fields/:id
```

Update Custom Field By Id

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

- **locationId** `string` _required_ — Location Id
- **name** `string` — Field name
- **description** `string` — Description of the field
- **placeholder** `string` — Placeholder text for the field
- **showInForms** `boolean` _required_ — Whether the field should be shown in forms
- **options** `object[]` — Options for the field. Important: Providing options will completely replace the existing options array. You must include all existing options alongside any new options you wish to add. Removal of options is not supported through this update. Applicable only for SINGLE_OPTIONS, MULTIPLE_OPTIONS, RADIO, CHECKBOX, TEXTBOX_LIST types.
- **acceptedFormats** `string` — Allowed file formats for uploads. Options include: .pdf, .docx, .doc, .jpg, .jpeg, .png, .gif, .csv, .xlsx, .xls, all
  - Available options: `.pdf`, `.docx`, `.doc`, `.jpg`, `.jpeg`, `.png`, `.gif`, `.csv`, `.xlsx`, `.xls`, `all`
- **maxFileLimit** `number` — Maximum file limit for uploads. Applicable only for fields with a data type of FILE_UPLOAD.

```json
{
  "locationId": "ve9EPM428h8vShlRW1KT",
  "name": "Name",
  "description": "string",
  "placeholder": "string",
  "showInForms": true,
  "options": [
    {
      "key": "string",
      "label": "string",
      "url": "string"
    }
  ],
  "acceptedFormats": ".pdf",
  "maxFileLimit": 2
}
```

### Response (200 · application/json)

Successful response

**Schema**

- **field** `object`

```json
{
  "field": {
    "locationId": "ve9EPM428h8vShlRW1KT",
    "name": "Name",
    "description": "string",
    "placeholder": "string",
    "showInForms": true,
    "options": [
      {
        "key": "string",
        "label": "string",
        "url": "string"
      }
    ],
    "acceptedFormats": ".pdf",
    "id": "string",
    "objectKey": "custom_object.pet",
    "dataType": "TEXT",
    "parentId": "3v34PM428h8vShlRW1KT",
    "fieldKey": "custom_object.pet.name",
    "allowCustomOption": true,
    "maxFileLimit": 2,
    "dateAdded": "2024-07-29T15:51:28.071Z",
    "dateUpdated": "2024-07-29T15:51:28.071Z"
  }
}
```
