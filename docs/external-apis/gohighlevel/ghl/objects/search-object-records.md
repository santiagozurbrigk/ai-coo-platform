---
title: "Search Object Records"
source: "https://marketplace.gohighlevel.com/docs/ghl/objects/search-object-records"
seccion: "Objects > Search Object Records > Search Object Records"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/objects/:schemaKey/records/search"
---

# Search Object Records

```http
POST /objects/:schemaKey/records/search
```

Supported Objects are custom objects and standard objects like "business". Documentation Link - [https://doc.clickup.com/8631005/d/h/87cpx-277156/93bf0c2e23177b0/87cpx-379336](https://doc.clickup.com/8631005/d/h/87cpx-277156/93bf0c2e23177b0/87cpx-379336)

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **schemaKey** `string` — custom object key

### Request body (application/json)

**Body required**

- **locationId** `string` _required_ — Location Id
- **page** `number` _required_ — Page
- **pageLimit** `number` _required_ — Page Limit
- **query** `string` _required_ — Pass this query parameter to search using your searchable properties. For example, if you have a custom object called “Pets” and have configured “name” as a searchable property, you can pass name:Buddy to search for pets with the name “Buddy.”
- **searchAfter** `string[]` _required_

```json
{
  "locationId": "ve9EPM428h8vShlRW1KT",
  "page": 1,
  "pageLimit": 10,
  "query": "Buddy",
  "searchAfter": [
    "sx6wyHhbFdRXh302Lunr",
    "sx6wyHhbFdRXh302Lunr"
  ]
}
```

### Response (200 · application/json)

Successful response

**Schema**

- **records** `object[]` — Records
- **total** `number` _required_ — Total Number of records

```json
{
  "records": [
    {
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
      "createdAt": "2024-07-29T15:51:28.071Z",
      "updatedAt": "2024-07-29T15:51:28.071Z",
      "locationId": "ve9EPM428h8vShlRW1KT",
      "objectId": "6d6f6e676f5f6576656e7473",
      "objectKey": "custom_objects.pet",
      "createdBy": {
        "channel": "WEB_USER",
        "createdAt": "2025-01-02T09:35:39.032Z",
        "source": "PUBLIC_API",
        "sourceId": "26653146-ec82-435d-8a99-84ecdb7fde13"
      },
      "lastUpdatedBy": {
        "channel": "WEB_USER",
        "createdAt": "2025-01-02T09:35:39.032Z",
        "source": "PUBLIC_API",
        "sourceId": "26653146-ec82-435d-8a99-84ecdb7fde13"
      },
      "searchAfter": [
        1738683828372,
        "67a235b49b289431bcf657f8"
      ]
    }
  ],
  "total": 20
}
```
