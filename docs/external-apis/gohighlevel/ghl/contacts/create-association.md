---
title: "Update Contacts Tags"
source: "https://marketplace.gohighlevel.com/docs/ghl/contacts/create-association"
seccion: "Contacts > Bulk > Update Contacts Tags"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/contacts/bulk/tags/update/:type"
---

# Update Contacts Tags

```http
POST /contacts/bulk/tags/update/:type
```

Allows you to update tags to multiple contacts at once, you can add or remove tags from the contacts

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **contacts** `string[]` _required_ — list of contact ids to be processed
- **tags** `string[]` _required_ — list of tags to be added or removed
- **locationId** `string` _required_ — location id from where the bulk request is executed
- **removeAllTags** `boolean` — Option to implement remove all tags. if true, all tags will be removed from the contacts. Can only be used with remove type.

```json
{
  "contacts": [
    "qFSqySFkVvNzOSqgGqFi",
    "abcdef",
    "qFSqySFkVvNzOSqgGqFi",
    "3ualbhnV7j3n3a9r2moD"
  ],
  "tags": [
    "tag-1",
    "tag-2"
  ],
  "locationId": "asdrwHvLUxlfw5SqKVCN",
  "removeAllTags": "false"
}
```

### Response (201 · application/json)

Successful response

**Schema**

- **succeeded** `boolean` _required_ — Indicates if the operation was successful
- **succeded** `boolean` _required_ — Legacy misspelling of `succeeded`. Deprecated; use `succeeded`.
- **errorCount** `number` _required_ — Number of errors encountered during the operation
- **responses** `string[]` _required_ — Responses for each contact processed

```json
{
  "succeeded": true,
  "errorCount": 0,
  "responses": [
    {
      "contactId": "qFSqySFkVvNzOSqgGqFi",
      "message": "Tags updated",
      "type": "success",
      "oldTags": [
        "tag-1",
        "tag-2"
      ],
      "tagsAdded": [],
      "tagsRemoved": []
    },
    {
      "contactId": "abcdef",
      "message": "contact id is not a valid firebase id",
      "type": "error"
    },
    {
      "contactId": "qFSqySFkVvNzOSqgGqFi",
      "message": "contact is deleted",
      "type": "error"
    },
    {
      "contactId": "3ualbhnV7j3n3a9r2moD",
      "message": "contact does not belong to location",
      "type": "error"
    }
  ]
}
```
