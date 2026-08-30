---
title: "Delete Sub-Account (Formerly Location)"
source: "https://marketplace.gohighlevel.com/docs/ghl/locations/delete-location"
seccion: "Sub-Account (Formerly location) > Sub-Account (Formerly Location) > Delete Sub-Account (Formerly Location)"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/locations/:locationId"
---

# Delete Sub-Account (Formerly Location)

```http
DELETE /locations/:locationId
```

Delete a Sub-Account (Formerly Location) from the Agency

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location Id

### Query parameters

- **deleteTwilioAccount** `boolean` _required_ — Boolean value to indicate whether to delete Twilio Account or not

### Response (200 · application/json)

Successful response

**Schema**

- **success** `boolean` _required_ — Success status of the API
- **message** `string` _required_ — Success message of the API

```json
{
  "success": true,
  "message": "Deleted location with id: ve9EPM428h8vShlRW1KT"
}
```
