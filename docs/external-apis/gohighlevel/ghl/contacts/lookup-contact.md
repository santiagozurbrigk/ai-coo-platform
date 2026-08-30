---
title: "Lookup Contact By Email Or Phone"
source: "https://marketplace.gohighlevel.com/docs/ghl/contacts/lookup-contact"
seccion: "Contacts > Contacts > Lookup Contact By Email Or Phone"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/contacts/lookup"
---

# Lookup Contact By Email Or Phone

```http
GET /contacts/lookup
```

Look up contacts matching an exact `email` or `phone`, scoped to a location, up to `limit` contacts (max 20) per page. Also matches against a contact's additional emails and additional phone numbers. Exactly one of `email` or `phone` must be provided. Paginate with `nextCursor`. Returns an empty `contacts` array if no contact matches. OAuth channel only.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location Id. Must be a non-empty string.
- **email** `string` — Exact email to look up (case-insensitive), mutually exclusive with `phone`.
- **phone** `string` — Exact phone number to look up, in E.164 format, mutually exclusive with `email`.
- **nextCursor** `string` — Opaque pagination cursor returned as `nextCursor` by a previous request.
- **limit** `integer` — Max number of contacts to return per page. Defaults to 20, capped at 20.

### Response (200 · application/json)

Successful response

**Schema**

- **contacts** `object[]` — Contacts matching the given email or phone, up to the requested `limit` (max 20)
- **nextCursor** `string` — Opaque cursor to fetch the next page. Present whenever the current page is full (`limit` results returned); a follow-up request with this cursor may return an empty `contacts` array if that was the last page.

```json
{
  "contacts": [
    {
      "id": "seD4PfOuKoVMLkEZqohJ",
      "name": "rubika deo",
      "locationId": "ve9EPM428h8vShlRW1KT",
      "firstName": "rubika",
      "lastName": "Deo",
      "email": "[email protected]",
      "emailLowerCase": "[email protected]",
      "timezone": "Asia/Calcutta",
      "companyName": "DGS VolMAX",
      "phone": "+18832327657",
      "dnd": true,
      "type": "lead",
      "source": "public api",
      "assignedTo": "ve9EPM428h8vShlRW1KT",
      "address1": "3535 1st St N",
      "city": "Birmingham",
      "state": "AL",
      "country": "US",
      "postalCode": "35061",
      "website": "https://www.tesla.com",
      "tags": [
        "nisi sint commodo amet",
        "consequat"
      ],
      "dateOfBirth": "1990-09-25",
      "dateAdded": "2021-07-02T05:18:26.704Z",
      "dateUpdated": "2021-07-02T05:18:26.704Z",
      "attachments": [],
      "ssn": "123-45-6789",
      "keyword": "test",
      "firstNameLowerCase": "rubika",
      "fullNameLowerCase": "rubika deo",
      "lastNameLowerCase": "deo",
      "lastActivity": "2021-07-16T11:39:30.564Z",
      "customFields": [
        {
          "id": "6dvNaf7VhkQ9snc5vnjJ",
          "value": "My Text"
        }
      ],
      "businessId": "641c094001436dbc2081e642",
      "attributionSource": {
        "url": "Trigger Link",
        "campaign": "Summer Sale"
      },
      "lastAttributionSource": {
        "url": "Organic Search",
        "campaign": "Brand Awareness"
      },
      "visitorId": "ve9EPM428h8vShlRW1KT",
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
  ],
  "nextCursor": "eyJkYXRlQWRkZWQiOjE3MDAwMDAwMDAwMDAsImlkIjoiYy1sYXN0In0="
}
```
