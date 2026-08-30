---
title: "Create Team Member"
source: "https://docs.whop.com/api-reference/beta/team-members/create-team-member"
capturado: "2026-08-30"
metodo: "POST"
path: "/team_members"
---

# Create Team Member

> Adds a member to an account's team with a system role. Identify them by exactly one of `user_id` or `email`. If the person has not yet accepted — or the email does not belong to a Whop account yet — an invitation is sent instead and the response is `202` with `{ "object": "team_member_invite", "invitation_sent": true }`. If they already have a pending invite, the request fails with a `400`. Custom roles cannot be granted via the API. Granting the `workforce` role is also allowed with the `bounty:create` scope.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`POST /team_members`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#post-team-members) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)