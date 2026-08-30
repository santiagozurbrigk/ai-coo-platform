---
title: "Upsert Contact"
source: "https://marketplace.gohighlevel.com/docs/ghl/contacts/upsert-contact"
seccion: "Contacts > Contacts > Upsert Contact"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/contacts/upsert"
---

# Upsert Contact

```http
POST /contacts/upsert
```

The Upsert API will adhere to the configuration defined under the "Allow Duplicate Contact" setting at the Location level. If the setting is configured to check both Email and Phone, the API will attempt to identify an existing contact based on the priority sequence specified in the setting, and will create or update the contact accordingly.

If two separate contacts already exist—one with the same email and another with the same phone—and an upsert request includes both the email and phone, the API will update the contact that matches the first field in the configured sequence, and ignore the second field to prevent duplication.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **firstName** `string` — First name of the contact
- **lastName** `string` — Last name of the contact
- **name** `string` — Full name of the contact
- **email** `string` — Email address of the contact
- **locationId** `string` _required_ — Location Id the contact should be created under
- **gender** `string` — Gender of the contact
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
- **source** `string` — Source from which the contact was created
- **dateOfBirth** `object` — The birth date of the contact. Supported formats: YYYY/MM/DD, MM/DD/YYYY, YYYY-MM-DD, MM-DD-YYYY, YYYY.MM.DD, MM.DD.YYYY, YYYY_MM_DD, MM_DD_YYYY
- **country** `string` — Country code of the contact (ISO 3166-1 alpha-2)
- **companyName** `string` — Company name of the contact
- **assignedTo** `string` — User's Id
- **createNewIfDuplicateAllowed** `boolean` — Controls whether to create a new contact or update an existing duplicate. **Scenario 1:** If this value is `true` and the location allows duplicate contacts, a new contact will be created immediately without checking for duplicates. **Scenario 2:** If this value is `true` but the location does not allow duplicate contacts, this field is ignored and the normal upsert behavior applies: the API will search for an existing duplicate contact, update it if found, or create a new contact if not found. **Scenario 3:** If this value is `false` or not provided, the normal upsert behavior applies regardless of the location's duplicate contact setting.

  **Default value:**

  `false`

- **dndSettings** `object` — Per-channel DND settings for the contact

```json
{
  "firstName": "Rosan",
  "lastName": "Deo",
  "name": "Rosan Deo",
  "email": "[email protected]",
  "locationId": "ve9EPM428h8vShlRW1KT",
  "gender": "male",
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
  "companyName": "DGS VolMAX",
  "assignedTo": "y0BeYjuRIlDwsDcOHOJo",
  "createNewIfDuplicateAllowed": false,
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

- **new** `boolean` — Whether a new contact was created (true) or an existing one was updated (false)
- **contact** `object` — Contact details
- **traceId** `string` — Unique trace identifier for this operation

```json
{
  "new": true,
  "contact": {
    "id": "seD4PfOuKoVMLkEZqohJ",
    "name": "rubika deo",
    "email": "[email protected]",
    "locationId": "ve9EPM428h8vShlRW1KT"
  },
  "traceId": "abc123trace"
}
```
