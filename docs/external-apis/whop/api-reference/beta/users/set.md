---
title: "Set"
source: "https://docs.whop.com/api-reference/beta/users/set"
capturado: "2026-08-30"
metodo: "PATCH"
path: "/users/me/preferences/notifications"
---

# Set

> Sets the authenticated user's notification preferences. Each preference is addressed by `scope`, not by id, so a scope read back from either list endpoint can be sent straight here.

A scope naming an experience with no topic sets that experience's level, and accepts all three levels. Any other scope sets a topic override, which is binary — `all` or `nothing` — and requires a `channel`.

`level: null` clears the preference. Preferences are stored as overrides, so clearing one means the scope inherits its default again rather than being switched off.

The batch is applied in one transaction: if any entry is rejected, none are written. Experience levels are applied before topic overrides, because setting a level replaces every topic preference for that experience — so an override sent alongside a level wins. The response reports what each scope now resolves to, in the order the entries were sent.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`PATCH /users/me/preferences/notifications`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#patch-users-me-preferences-notifications) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)