---
title: "Upload files to custom fields"
source: "https://marketplace.gohighlevel.com/docs/ghl/forms/upload-to-custom-fields"
seccion: "Forms > Forms > Upload files to custom fields"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/forms/upload-custom-files"
---

# Upload files to custom fields

```http
POST /forms/upload-custom-files
```

Post the necessary fields for the API to upload files. The files need to be a buffer with the key "< custom_field_id >_< file_id >". 
 Here custom field id is the ID of your custom field and file id is a randomly generated id (or uuid) 
 There is support for multiple file uploads as well. Have multiple fields in the format mentioned.
File size is limited to 50 MB.

 The allowed file types are:

- PDF
- DOCX
- DOC
- JPG
- JPEG
- PNG
- GIF
- CSV
- XLSX
- XLS
- MP4
- MPEG
- ZIP
- RAR
- TXT
- SVG

The API will return the updated contact object.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **contactId** `string` _required_ — Contact ID to upload the file to.
- **locationId** `string` _required_ — Location ID of the contact.

**Body required**

### Response (200)

Successful response
