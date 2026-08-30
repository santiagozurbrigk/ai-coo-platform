---
title: "Create Custom Field"
source: "https://marketplace.gohighlevel.com/docs/ghl/custom-fields/create-custom-field"
seccion: "Custom Fields V2 > Custom Fields V2 > Create Custom Field"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/custom-fields/"
---

# Create Custom Field

```http
POST /custom-fields/
```

Create Custom Field

> info
>
> Only supports Custom Objects and Company (Business) today. Will be extended to other Standard Objects in the future.
>

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **locationId** `string` _required_ — Location Id
- **name** `string` — Field name
- **description** `string` — Description of the field
- **placeholder** `string` — Placeholder text for the field
- **showInForms** `boolean` _required_ — Whether the field should be shown in forms
- **options** `object[]` — Options for the field (Optional, valid only for SINGLE_OPTIONS, MULTIPLE_OPTIONS, RADIO, CHECKBOX, TEXTBOX_LIST type)
- **acceptedFormats** `string` — Allowed file formats for uploads. Options include: .pdf, .docx, .doc, .jpg, .jpeg, .png, .gif, .csv, .xlsx, .xls, all
  - Available options: `.pdf`, `.docx`, `.doc`, `.jpg`, `.jpeg`, `.png`, `.gif`, `.csv`, `.xlsx`, `.xls`, `all`
- **dataType** `string` _required_ — Type of field that you are trying to create
  - Available options: `TEXT`, `LARGE_TEXT`, `NUMERICAL`, `PHONE`, `MONETORY`, `CHECKBOX`, `SINGLE_OPTIONS`, `MULTIPLE_OPTIONS`, `DATE`, `TEXTBOX_LIST`, `FILE_UPLOAD`, `RADIO`
- **fieldKey** `string` _required_ — Field key. For Custom Object it's formatted as "custom_object.{objectKey}.{fieldKey}". "custom_object" is a fixed prefix, "{objectKey}" is your custom object's identifier, and "{fieldKey}" is the unique field name within that object. Example: "custom_object.pet.name" for a "name" field in a "pet" custom object.
- **objectKey** `string` _required_ — The key for your custom object. This key uniquely identifies the custom object. Example: "custom_object.pet" for a custom object related to pets.
- **maxFileLimit** `number` — Maximum file limit for uploads. Applicable only for fields with a data type of FILE_UPLOAD.
- **allowCustomOption** `boolean` — Determines if users can add a custom option value different from the predefined options in records for RADIO type fields. A custom value added in one record does not automatically become an option and will not appear as an option for other records.
- **parentId** `string` _required_ — ID of the parent folder

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
  "dataType": "TEXT",
  "fieldKey": "custom_object.pet.name",
  "objectKey": "custom_object.pet",
  "maxFileLimit": 2,
  "allowCustomOption": true,
  "parentId": "string"
}
```

### Response (201 · application/json)

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
