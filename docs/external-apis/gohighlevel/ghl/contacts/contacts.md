---
title: "Contacts"
source: "https://marketplace.gohighlevel.com/docs/ghl/contacts/contacts"
seccion: "Contacts > Contacts"
api_version: "v3"
capturado: "2026-08-30"
---

# Contacts

Documentation for Contacts API

- [Lookup Contact By Email Or Phone](https://marketplace.gohighlevel.com/docs/ghl/contacts/lookup-contact) — Look up contacts matching an exact `email` or `phone`, scoped to a location, up to `limit` contacts (max 20) per page. Also matches against a contact's additional emails and additional phone numbers. Exactly one of `email` or `phone` must be provided. Paginate with `nextCursor`. Returns an empty `contacts` array if no contact matches. OAuth channel only.
- [Delete Contact](https://marketplace.gohighlevel.com/docs/ghl/contacts/delete-contact)
- [Get Contact](https://marketplace.gohighlevel.com/docs/ghl/contacts/get-contact) — Retrieves a contact by its unique identifier.
- [Update Contact](https://marketplace.gohighlevel.com/docs/ghl/contacts/update-contact) — Update a contact using contactId
- [Upsert Contact](https://marketplace.gohighlevel.com/docs/ghl/contacts/upsert-contact) — The Upsert API will adhere to the configuration defined under the 'Allow Duplicate Contact' setting at the Location level. If the setting is configured to check both Email and Phone, the API will attempt to identify an existing contact based on the priority sequence specified in the setting, and will create or update the contact accordingly.<br/><br/>If two separate contacts already exist—one with the same email and another with the same phone—and an upsert request includes both the email and phone, the API will update the contact that matches the first field in the configured sequence, and ignore the second field to prevent duplication.
- [Get Contacts By BusinessId](https://marketplace.gohighlevel.com/docs/ghl/contacts/get-contacts-by-business-id)
- [Create Contact](https://marketplace.gohighlevel.com/docs/ghl/contacts/create-contact) — Create a new contact
