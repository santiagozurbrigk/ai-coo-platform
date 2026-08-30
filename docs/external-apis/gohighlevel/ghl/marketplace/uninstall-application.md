---
title: "Uninstall an application"
source: "https://marketplace.gohighlevel.com/docs/ghl/marketplace/uninstall-application"
seccion: "Developer marketplace > App Management > Uninstall an application"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/marketplace/app/:appId/installations"
---

# Uninstall an application

```http
DELETE /marketplace/app/:appId/installations
```

Uninstalls an application from your company or a specific location. This will remove the application`s access and stop all its functionalities

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **appId** `string` _required_ — The application id which is to be uninstalled.

### Request body (application/json)

**Body required**

- **companyId** `string` — The company id from which the application is to be uninstalled. If you pass agency token, then companyId is required. It will uninstall application from agency as well as all sub-accounts.
- **locationId** `string` — The location id from which the application is to be uninstalled. If you pass location token, then locationId is required. It will uninstall application from that location only.
- **reason** `string` — The reason for uninstalling the application. Reason is required if you are uninstalling the application as a developer.

```json
{
  "companyId": "tDtDnQdgm2LXpyiqYvZ6",
  "locationId": "tDtDnQdgm2LXpyiqYvZ6",
  "reason": "Application is not working as expected"
}
```

### Response (200 · application/json)

Successfully uninstalled the application

**Schema**

- **success** `boolean` _required_ — The status of the uninstallation of the application

```json
{
  "success": true
}
```
