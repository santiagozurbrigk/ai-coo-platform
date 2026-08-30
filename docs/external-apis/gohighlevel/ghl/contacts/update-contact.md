---
title: "Update Contact"
source: "https://marketplace.gohighlevel.com/docs/ghl/contacts/update-contact"
seccion: "Contacts > Contacts > Update Contact"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/contacts/:contactId"
---

# Update Contact

```http
PUT /contacts/:contactId
```

Update a contact using contactId

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **contactId** `string` _required_ — Unique identifier of the contact

### Request body (application/json)

**Body required**

- **firstName** `string` — First name of the contact
- **lastName** `string` — Last name of the contact
- **name** `string` — Full name of the contact
- **email** `string` — Email address of the contact
- **phone** `string` — Phone number of the contact
- **address1** `string` — Street address of the contact
- **city** `string` — City of the contact
- **state** `string` — State of the contact
- **postalCode** `string` — Postal code of the contact
- **website** `string` — Website URL of the contact
- **timezone** `string` — Timezone of the contact
- **dnd** `boolean` — Whether Do Not Disturb is enabled for the contact
- **inboundDndSettings** `object` — Inbound DND settings per channel for the contact
- **tags** `string[]` — This field will overwrite all current tags associated with the contact. To update a tags, it is recommended to use the Add Tag or Remove Tag API instead.
- **customFields** `object[]` — List of custom field values to assign to the contact
- **source** `string` — Source from which the contact was updated
- **dateOfBirth** `object` — The birth date of the contact. Supported formats: YYYY/MM/DD, MM/DD/YYYY, YYYY-MM-DD, MM-DD-YYYY, YYYY.MM.DD, MM.DD.YYYY, YYYY_MM_DD, MM_DD_YYYY
- **country** `string` — Country code of the contact (ISO 3166-1 alpha-2), Refer country list from documentaion, documentation has list of all countries
- **assignedTo** `string` — User's Id
- **dndSettings** `object` — Per-channel DND settings for the contact

```json
{
  "firstName": "rosan",
  "lastName": "Deo",
  "name": "rosan Deo",
  "email": "[email protected]",
  "phone": "+1 888-888-8888",
  "address1": "3535 1st St N",
  "city": "Dolomite",
  "state": "AL",
  "postalCode": "35061",
  "website": "https://www.tesla.com",
  "timezone": "America/Chihuahua",
  "dnd": true,
  "inboundDndSettings": {
    "all": {
      "status": "active",
      "message": "Do not contact me"
    }
  },
  "tags": [
    "nisi sint commodo amet",
    "consequat"
  ],
  "customFields": [
    {
      "id": "6dvNaf7VhkQ9snc5vnjJ",
      "key": "my_custom_field",
      "fieldValue": "My Text"
    }
  ],
  "source": "public api",
  "dateOfBirth": "1990-09-25",
  "country": "US",
  "assignedTo": "y0BeYjuRIlDwsDcOHOJo",
  "dndSettings": {
    "call": {
      "status": "active",
      "message": "Do not call"
    },
    "email": {
      "status": "inactive"
    }
  }
}
```

### Response (200 · application/json)

Successful response

**Schema**

- **succeeded** `boolean` — Whether the update operation succeeded
- **contact** `object` — Contact details

```json
{
  "succeeded": true,
  "contact": {
    "id": "seD4PfOuKoVMLkEZqohJ",
    "name": "rubika deo",
    "email": "[email protected]",
    "locationId": "ve9EPM428h8vShlRW1KT"
  }
}
```
