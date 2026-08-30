---
title: "List"
source: "https://docs.whop.com/api-reference/beta/users/list"
capturado: "2026-08-30"
metodo: "GET"
path: "/users/me/passkeys"
---

# List

> Lists the authenticated user's own passkeys, newest first. The list is always the caller's own; there is no parameter for reading another user's passkeys. Requires a user session: an API key or an OAuth token is refused, because a passkey confirms the account holder before a sensitive action and no app may enumerate one.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`GET /users/me/passkeys`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#get-users-me-passkeys) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)