---
title: "Retrieve User"
source: "https://docs.whop.com/api-reference/beta/users/retrieve-user"
capturado: "2026-08-30"
metodo: "GET"
path: "/users/{id}"
---

# Retrieve User

> Retrieves a user by `user_` tag or username, or the authenticated user with the reserved id `me`. Profiles include linked social accounts — reading your own profile returns every linked account, other profiles only what is public on Whop (the primary Discord and the X account). The self-only fields are populated only when the id is `me`: `email` (email-read scope), `staff` (Whop staff only, staff-read scope), `balance` and `earnings_usd` (balance-read scope), and the opt-in `balance_history`. They are always `null` when addressing a user by tag or username.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`GET /users/{id}`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#get-users-id) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)