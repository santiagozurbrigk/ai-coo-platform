---
title: "Create Record"
source: "https://marketplace.gohighlevel.com/docs/ghl/objects/create-object-record"
seccion: "Objects > Records > Create Record"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/objects/:schemaKey/records"
---

# Create Record

```http
POST /objects/:schemaKey/records
```

Create a Custom Object Record. Supported Objects business and custom objects. Documentation Link - [https://doc.clickup.com/8631005/d/h/87cpx-277156/93bf0c2e23177b0/87cpx-376296](https://doc.clickup.com/8631005/d/h/87cpx-277156/93bf0c2e23177b0/87cpx-376296)

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **schemaKey** `string` _required_ — The key of the Custom Object / Standard Object Schema. For custom objects, the key must include the “custom_objects.” prefix, while standard objects use their respective object keys. This information is available on the Custom Objects Details page under Settings.

**Body required**

- **** `object`

```json
{}
```

### Response (201 · application/json)

Successful response

**Schema**

- **record** `object`

```json
{
  "record": {
    "id": "661c06b4ffde146bdb469442",
    "owner": [
      "sx6wyHhbFdRXh302Lunr"
    ],
    "followers": [
      "sx6wyHhbFdRXh302Lunr",
      "v5cEPM428h8vShlRW1KT"
    ],
    "properties": {
      "customer_number": 1424,
      "ticket_name": "Customer not able login",
      "phone_number": "+917000000000",
      "money": {
        "currency": "default",
        "value": 100
      },
      "type_of_ticket": "doubt",
      "section_of_app": [
        "contacts",
        "smartlist"
      ],
      "recieved_on": "2024-07-11",
      "my_files": [
        {
          "url": "---url_of_file---"
        }
      ],
      "my_textbox_list.option_a": "Value 1",
      "my_textbox_list.option_b": "Value 2"
    },
    "dateAdded": "2024-07-29T15:51:28.071Z",
    "dateUpdated": "2024-07-29T15:51:28.071Z"
  }
}
```
