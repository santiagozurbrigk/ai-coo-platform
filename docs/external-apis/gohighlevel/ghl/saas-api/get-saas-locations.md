---
title: "Get SaaS Locations"
source: "https://marketplace.gohighlevel.com/docs/ghl/saas-api/get-saas-locations"
seccion: "SaaS > SaaS > Get SaaS Locations"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/saas/saas-locations/:companyId"
---

# Get SaaS Locations

```http
GET /saas/saas-locations/:companyId
```

Fetch all SaaS-activated locations for a company with pagination

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **companyId** `string` _required_

### Query parameters

- **page** `number` _required_

### Response (200 · application/json)

Paginated SaaS-enabled sub-accounts for the company.

**Schema**

- **locations** `object[]` _required_ — Array of SaaS locations
- **pagination** `object` _required_

```json
{
  "locations": [
    {
      "locationId": "locationId1",
      "companyId": "companyId1",
      "saasMode": "saasV2",
      "subscriptionId": "subscriptionId1",
      "customerId": "customerId1",
      "name": "John Doe",
      "email": "[email protected]",
      "providerLocationId": "r06mdj4OrrERzYDvsOdh",
      "isSaaSV2": true,
      "subscriptionInfo": {
        "priceId": "price_1QDPY5FpU9DlKp7RQ8BXfywx",
        "saasPlanId": "66c4d36534f21f900dc2a265",
        "stripeProductId": "prod_1QDPY5FpU9DlKp7RQ8BXfywx",
        "subscriptionStatus": "active"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": true
  }
}
```
