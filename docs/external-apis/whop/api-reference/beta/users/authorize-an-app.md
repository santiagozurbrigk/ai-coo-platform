---
title: "Authorize an App"
source: "https://docs.whop.com/api-reference/beta/users/authorize-an-app"
capturado: "2026-08-30"
metodo: "POST"
path: "/users/me/oauth_grants"
---

# Authorize an App

> Completes the OAuth authorization step for the authenticated user: records their consent for the scopes an app asked for and mints the authorization code to hand back to it. Returns the grant, plus a `redirect_url` carrying that code — the one and only time it is returned. Exchange the code at `POST /oauth/token` with the verifier for `code_challenge`. Requires a user session, because consent has to come from the account holder: an API key or an OAuth token is refused, so an app can never authorize itself. Send an `Idempotency-Key` to make a retry safe — a replay returns the original `redirect_url` and its code rather than issuing a second one.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`POST /users/me/oauth_grants`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#post-users-me-oauth-grants) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)