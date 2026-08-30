---
title: "Get ad account details"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/li-get-ad-account-details"
seccion: "Ad Manager > LinkedIn Integration > Get ad account details"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/ad-publishing/linkedin/ad-account"
---

# Get ad account details

```http
GET /ad-publishing/linkedin/ad-account
```

Retrieve details of a specific LinkedIn ad account

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location identifier
- **adAccountId** `string` _required_ — Ad account identifier

### Response (200 · application/json)

Details for a single ad account, including the organization logo

**Schema**

- **id** `number` _required_ — LinkedIn ad account id. Returned as a number, unlike most ids in this API.
- **name** `string` _required_ — Account name
- **status** `string` _required_ — Account status
- **currency** `string` _required_ — Account billing currency, ISO 4217
- **servingStatuses** `string[]` _required_ — Why the account can or cannot serve ads
- **organizationId** `string` _required_ — Organization URN that owns the account, from LinkedIn `reference`
- **organizationLogo** `string` — Organization logo URL. LinkedIn media URLs are time-limited and expire.

```json
{
  "id": 556129919,
  "name": "Acme Test Account",
  "status": "ACTIVE",
  "currency": "USD",
  "servingStatuses": [
    "RUNNABLE"
  ],
  "organizationId": "urn:li:organization:2414183",
  "organizationLogo": "https://media.licdn.com/dms/image/v2/.../company-logo_400_400?e=1788998400&v=beta&t=xc-DB8"
}
```
