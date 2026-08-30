---
title: "Get Duplicate Contact"
source: "https://marketplace.gohighlevel.com/docs/ghl/contacts/get-duplicate-contact"
seccion: "Contacts > Search > Get Duplicate Contact"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/contacts/search/duplicate"
---

# Get Duplicate Contact

```http
GET /contacts/search/duplicate
```

Get Duplicate Contact.

If `Allow Duplicate Contact` is disabled under Settings, the global unique identifier will be used for searching the contact. If the setting is enabled, first priority for search is `email` and the second priority will be `phone`.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location Id
- **number** `string` — Phone Number — URL-encoded. E.g. +1423164516 → %2B1423164516
- **email** `string` — Email — URL-encoded. E.g. [[email protected]](https://marketplace.gohighlevel.com/cdn-cgi/l/email-protection#74001107005f151617341319151d185a171b19) → test%2Babc%40gmail.com

### Response (200)
