---
title: "Create Challenge"
source: "https://docs.whop.com/api-reference/beta/users/create-challenge"
capturado: "2026-08-30"
metodo: "POST"
path: "/users/me/passkeys/challenge"
---

# Create Challenge

> Mints the challenge a browser needs to run a WebAuthn ceremony against the authenticated user's own passkeys. A `registration` challenge enrolls a new passkey; a `deletion` challenge is bound to the one passkey named by `passkey_id` and proves the user still holds it. Challenges are single-use and expire 5 minutes after they are issued, so send a fresh `Idempotency-Key` per ceremony — a replayed key returns the original challenge, which may already have expired. Requires a user session.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`POST /users/me/passkeys/challenge`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#post-users-me-passkeys-challenge) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)