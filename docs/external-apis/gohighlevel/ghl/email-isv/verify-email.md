---
title: "Email Verification"
source: "https://marketplace.gohighlevel.com/docs/ghl/email-isv/verify-email"
seccion: "Email ISV > Email Verification > Email Verification"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/email/verify"
---

# Email Verification

```http
POST /email/verify
```

Verify Email

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location Id, The email verification charges will be deducted from this location (if rebilling is enabled) / company wallet

### Request body (application/json)

**Body required**

- **type** `string` _required_ — Email Verification type
  - Available options: `email`, `contact`
- **verify** `string` _required_ — Email Verification recepient (email address / contactId)

```json
{
  "type": "email",
  "verify": "[email protected]"
}
```

### Response (201 · application/json)

Successful response

**Schema**

oneOf

- **reason** `string[]` — Reason for email verification failure
- **result** `string` _required_ — Email verification result
  - Available options: `deliverable`, `undeliverable`, `do_not_send`, `unknown`, `catch_all`
- **risk** `string` _required_ — Risk level of email sending to bounce
  - Available options: `high`, `low`, `medium`, `unknown`
- **address** `string` _required_ — Email address
- **leadConnectorRecommendation** `object` — Lead Connector email verification recommendation

```json
{
  "reason": [
    "mailbox_does_not_exist"
  ],
  "result": "undeliverable",
  "risk": "low",
  "address": "[email protected]",
  "leadConnectorRecommendation": {
    "isEmailValid": false
  }
}
```
