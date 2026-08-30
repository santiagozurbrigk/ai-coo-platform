---
title: "Add/Remove Contacts From Business"
source: "https://marketplace.gohighlevel.com/docs/ghl/contacts/add-remove-contact-from-business"
seccion: "Contacts > Bulk > Add/Remove Contacts From Business"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/contacts/bulk/business"
---

# Add/Remove Contacts From Business

```http
POST /contacts/bulk/business
```

Add/Remove Contacts From Business . Passing a `null` businessId will remove the businessId from the contacts

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **locationId** `string` _required_ — Location Id
- **ids** `string[]` _required_ — List of contact Ids to update (maximum 50) **Possible values:** `<= 50 characters`
- **businessId** `string` _required_ — Business Id to assign to contacts. Pass null to remove business association.

```json
{
  "locationId": "PX8m5VwxEbcpFlzYEPVG",
  "ids": [
    "IDqvFHGColiyK6jiatuz",
    "pOC0uJ97VYOKH2m3fkMD"
  ],
  "businessId": "63b7ec34ea409a9a8bd2a4ff"
}
```

### Response (200 · application/json)

Successful response

**Schema**

- **success** `boolean` _required_ — Whether the bulk update was successful
- **ids** `string[]` _required_ — List of contact Ids that were updated

```json
{
  "success": true,
  "ids": [
    "pOC0uJ97VYOKH2m3fkMD"
  ]
}
```
