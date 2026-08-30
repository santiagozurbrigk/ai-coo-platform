---
title: "List Team Members"
source: "https://docs.whop.com/api-reference/beta/team-members/list-team-members"
capturado: "2026-08-30"
metodo: "GET"
path: "/team_members"
---

# List Team Members

> Lists an account's team members, including pending invites (`status: "pending"`, `ausri_` ids; `user` is `null` for invites sent to an email with no Whop account yet). For accepted members, `email` requires the `company:authorized_user:email:read` scope and is `null` otherwise. Listing `role=workforce` is also allowed with the `bounty:create` scope.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`GET /team_members`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#get-team-members) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)