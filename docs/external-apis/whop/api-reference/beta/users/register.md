---
title: "Register"
source: "https://docs.whop.com/api-reference/beta/users/register"
capturado: "2026-08-30"
metodo: "POST"
path: "/users/me/passkeys"
---

# Register

> Registers a passkey for the authenticated user from the attestation a browser produced for a `registration` challenge. Mint that challenge first with `POST /users/me/passkeys/challenge`; it is single-use and expires 5 minutes after it is issued. Requires a user session.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`POST /users/me/passkeys`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#post-users-me-passkeys) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)