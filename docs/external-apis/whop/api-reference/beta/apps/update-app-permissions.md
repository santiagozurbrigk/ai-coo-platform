---
title: "Update App Permissions"
source: "https://docs.whop.com/api-reference/beta/apps/update-app-permissions"
capturado: "2026-08-30"
metodo: "PATCH"
path: "/apps/{id}/permissions"
---

# Update App Permissions

> Replaces the set of permissions the app requests from users when they install it. Requires a user session: the `developer:update_app_authorization` scope cannot be delegated to API keys. Sensitive permissions require step-up verification.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`PATCH /apps/{id}/permissions`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#patch-apps-id-permissions) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)