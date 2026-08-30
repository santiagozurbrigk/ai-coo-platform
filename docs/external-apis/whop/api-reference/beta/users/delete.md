---
title: "Delete"
source: "https://docs.whop.com/api-reference/beta/users/delete"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/users/me/passkeys/{id}"
---

# Delete

> Deletes one of the authenticated user's own passkeys. The request body carries a WebAuthn assertion from the passkey being deleted, so possession of the credential is proven before it is removed: mint a `deletion` challenge for it first, run the ceremony with that passkey, and send the result here. Deleting the user's last passkey is allowed — their other step-up factors remain. Requires a user session.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`DELETE /users/me/passkeys/{id}`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#delete-users-me-passkeys-id) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)