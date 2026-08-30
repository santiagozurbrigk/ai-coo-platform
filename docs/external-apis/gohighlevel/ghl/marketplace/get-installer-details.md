---
title: "Get Installer Details"
source: "https://marketplace.gohighlevel.com/docs/ghl/marketplace/get-installer-details"
seccion: "Developer marketplace > App Management > Get Installer Details"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/marketplace/app/:appId/installations"
---

# Get Installer Details

```http
GET /marketplace/app/:appId/installations
```

Fetches installer details for the authenticated user. This endpoint returns information about the company, location, user, and installation details associated with the current OAuth token.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **appId** `string` _required_ — ID of the app to get installer details

### Response (200 · application/json)

Successfully retrieved installer details. Returns company, location, user, and installation information.

**Schema**

- **installationDetails** `object` _required_ — Installation details

```json
{
  "installationDetails": {
    "companyId": "company123",
    "locationId": "location123",
    "companyName": "Example Company",
    "relationshipNumber": "0-002-230",
    "companyEmail": "[email protected]",
    "companyOwnerFullName": "John Doe",
    "userId": "user123",
    "isWhitelabelCompany": false,
    "companyPlan": "agency_monthly_497",
    "companyHighLevelPlan": "agency_monthly_497",
    "marketplaceAppPlanId": "plan123"
  }
}
```
