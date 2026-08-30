---
title: "Upload file attachments"
source: "https://marketplace.gohighlevel.com/docs/ghl/conversations/upload-file-attachments"
seccion: "Conversations > Messages > Upload file attachments"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/conversations/messages/upload"
---

# Upload file attachments

```http
POST /conversations/messages/upload
```

Post the necessary fields for the API to upload files. The files need to be a buffer with the key "fileAttachment". 

 **Note:** One of conversationId or contactId must be provided. 

 **File Size Limits:**

- Maximum file size: 5 MB
- Maximum files per upload: 5

Allowed file types:

Images:

JPG, JPEG, PNG, GIF, SVG, HEIC, AI

Videos:

MP4, MPEG, 3GP

Audio:

MP3, WAV, WAVE, AIFF, AIF, AIFC, GSM, ULAW, OGG, AAC, M4A, AMR

Documents:

PDF, DOC, DOCX, TXT, CSV, XLS, XLSX, PPT, PPTX, ODT

Archives:

ZIP, RAR

Other:

VCF, VCARD (contact files), ICS (calendar files)

The API will return an object with the URLs

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (multipart/form-data)

**Body required**

- **conversationId** `string` — Conversation Id
- **contactId** `string` — Contact Id
- **workflowId** `string` — Workflow Id
- **campaignId** `string` — Campaign Id
- **locationId** `string` _required_
- **attachmentUrls** `string[]` _required_

```json
{
  "conversationId": "ve9EPM428h8vShlRW1KT",
  "contactId": "ve9EPM428h8vShlRW1KT",
  "workflowId": "ve9EPM428h8vShlRW1KT",
  "campaignId": "ve9EPM428h8vShlRW1KT",
  "locationId": "string",
  "attachmentUrls": [
    "string"
  ]
}
```

### Response (200 · application/json)

Uploaded the file successfully

**Schema**

- **uploadedFiles** `object` _required_

```json
{
  "uploadedFiles": {}
}
```
