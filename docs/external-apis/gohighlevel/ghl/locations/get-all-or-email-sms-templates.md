---
title: "GET all or email/sms templates"
source: "https://marketplace.gohighlevel.com/docs/ghl/locations/get-all-or-email-sms-templates"
seccion: "Sub-Account (Formerly location) > Template > GET all or email/sms templates"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/locations/:locationId/templates"
---

# GET all or email/sms templates

```http
GET /locations/:locationId/templates
```

GET all or email/sms templates

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location Id

### Query parameters

- **deleted** `boolean`

  Default value:

  `false`

- **skip** `string`

  Default value:

  `0`

- **limit** `string`

  Default value:

  `25`

- **type** `string`
  - Available options: `sms`, `email`, `whatsapp`
- **originId** `string` _required_ — Origin Id

### Response (200 · application/json)

Successful response

**Schema**

- **templates** `object[]`
- **totalCount** `number`

```json
{
  "templates": [
    {
      "id": "2yMwhgTNO19bpintqrap",
      "name": "sms template",
      "type": "sms",
      "template": {
        "body": "sms body",
        "attachments": []
      },
      "dateAdded": "2022-01-27T12:31:19.679Z",
      "locationId": "ve9EPM428h8vShlRW1KT",
      "urlAttachments": []
    },
    {
      "id": "2yMwhgTNO19bpintqrap",
      "name": "email template",
      "type": "email",
      "dateAdded": "2022-01-27T12:31:19.679Z",
      "template": {
        "subject": "subject text",
        "attachments": [],
        "html": "<html><head><style>body{font-family: sans-serif;}</style></head><body>testing</body></html>"
      },
      "locationId": "ve9EPM428h8vShlRW1KT"
    }
  ],
  "totalCount": 100
}
```
