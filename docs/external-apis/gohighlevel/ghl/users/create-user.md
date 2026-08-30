---
title: "Create User"
source: "https://marketplace.gohighlevel.com/docs/ghl/users/create-user"
seccion: "Users > Users > Create User"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/users/"
---

# Create User

```http
POST /users/
```

Create User

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **companyId** `string` _required_ — Company/Agency ID to associate the user with
- **email** `string` _required_ — Email address of the user (used for login)
- **password** `string` _required_ — Password for the user account. All passwords will be required to meet the following criteria:
  - Minimum 12 characters
  - At least one uppercase letter (A–Z)
  - At least one lowercase letter (a–z)
  - At least one number (0–9)
  - At least one special character (e.g., !, @, #, $)
- **phone** `string` — Phone number of the user in E.164 format
- **type** `string` _required_ — User account type (account for sub-account users, agency for agency-level users)
- **role** `string` _required_ — User role within the account (admin or user)
- **locationIds** `string[]` _required_ — List of location IDs to assign to the user
- **permissions** `object` — User permissions controlling access to various features
- **scopes** `string[]` — Scopes allowed for users. Only scopes that have been passed will be enabled. Note:- If passed empty all the scopes will be get disabled
  - Available options: `campaigns.readonly`, `campaigns.write`, `calendars.readonly`, `calendars/events.write`, `calendars/groups.write`, `calendars.write`, `contacts.write`, `contacts/bulkActions.write`, `workflows.readonly`, `workflows.write`, `triggers.write`, `funnels.write`
- **scopesAssignedToOnly** `string[]` — Assigned Scopes allowed for users. Only scopes that have been passed will be enabled. If passed empty all the assigned scopes will be get disabled
  - Available options: `campaigns.readonly`, `campaigns.write`, `calendars.readonly`, `calendars/events.write`, `calendars/groups.write`, `calendars.write`, `contacts.write`, `contacts/bulkActions.write`, `workflows.readonly`, `workflows.write`, `triggers.write`, `funnels.write`
- **profilePhoto** `string` — URL of the user profile photo
- **twilioPhone** `object` — Per-location inbound Twilio number in E.164 format, keyed by location id (Call and Voicemail Inbound Number for direct Twilio, not LC Phone). Replacement semantics: if you send twilioPhone in the request body, the stored map is replaced entirely with this object (not merged). Any location id omitted from the object is removed from the saved map. Omit the twilioPhone property entirely to leave existing numbers unchanged. Send an empty object {} to clear all per-location numbers. To clear a single location only, set that location id to an empty string "".
- **platformLanguage** `string` — Platform language preference for the user
  - Available options: `en_US`, `es`, `fr_CA`, `fr_FR`, `nl`, `de`, `pt_PT`, `pt_BR`, `it`, `sv`, `da`, `fi`
- **firstName** `string` _required_ — First name of the user
- **lastName** `string` _required_ — Last name of the user

```json
{
  "companyId": "ve9EPM428h8vShlRW1KT",
  "email": "[email protected]",
  "password": "************",
  "phone": "+18832327657",
  "type": "account",
  "role": "admin",
  "locationIds": [
    "C2QujeCh8ZnC7al2InWR"
  ],
  "permissions": {
    "campaignsEnabled": true,
    "campaignsReadOnly": false,
    "contactsEnabled": true,
    "workflowsEnabled": true
  },
  "scopes": [
    "contacts.write",
    "campaigns.readonly"
  ],
  "scopesAssignedToOnly": [
    "contacts.write",
    "campaigns.readonly"
  ],
  "profilePhoto": "https://img.png",
  "twilioPhone": {
    "C2QujeCh8ZnC7al2InWR": "+18832327657",
    "M2QrtfVt8ZnC7cv2InDL": "+18832327657"
  },
  "platformLanguage": "en_US",
  "firstName": "John",
  "lastName": "Deo"
}
```

### Response (201 · application/json)

Successful response

**Schema**

- **id** `string` — Unique identifier of the user
- **name** `string` — Full name of the user
- **firstName** `string` — First name of the user
- **lastName** `string` — Last name of the user
- **email** `string` — Email address of the user
- **phone** `string` — Phone number of the user
- **extension** `string` — Phone extension of the user
- **permissions** `object` — User permissions controlling access to various features
- **scopes** `string` — List of OAuth scopes granted to this user
  - Available options: `campaigns.readonly`, `campaigns.write`, `calendars.readonly`, `calendars/events.write`, `calendars/groups.write`, `calendars.write`, `contacts.write`, `contacts/bulkActions.write`, `workflows.readonly`, `workflows.write`, `triggers.write`, `funnels.write`
- **roles** `object` — Role and access configuration for the user
- **lcPhone** `object` — LC Phone Inbound Phone Numbers
- **platformLanguage** `string` — Platform language preference for the user
  - Available options: `en_US`, `es`, `fr_CA`, `fr_FR`, `nl`, `de`, `pt_PT`, `pt_BR`, `it`, `sv`, `da`, `fi`

```json
{
  "id": "0IHuJvc2ofPAAA8GzTRi",
  "name": "John Deo",
  "firstName": "John",
  "lastName": "Deo",
  "email": "[email protected]",
  "phone": "+1 808-868-8888",
  "extension": "",
  "permissions": {
    "campaignsEnabled": true,
    "campaignsReadOnly": false,
    "contactsEnabled": true,
    "workflowsEnabled": true
  },
  "scopes": [
    "contacts.write",
    "campaigns.readonly"
  ],
  "roles": {
    "type": "account",
    "role": "admin",
    "locationIds": [
      "ve9EPM428h8vShlRW1KT"
    ]
  },
  "lcPhone": {
    "locationId": "+1234556677"
  },
  "platformLanguage": "en_US"
}
```
