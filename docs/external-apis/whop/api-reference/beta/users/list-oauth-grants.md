---
title: "List OAuth Grants"
source: "https://docs.whop.com/api-reference/beta/users/list-oauth-grants"
capturado: "2026-08-30"
metodo: "GET"
path: "/users/me/oauth_grants"
---

# List OAuth Grants

> Lists the authenticated user's own OAuth grants — one per app they have authorized, per account they authorized it for. The list is always the caller's own; there is no parameter for reading another user's grants. Requires a user session: an API key or an OAuth token is refused, so an app can never enumerate the other apps a user has authorized.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`GET /users/me/oauth_grants`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#get-users-me-oauth-grants) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)