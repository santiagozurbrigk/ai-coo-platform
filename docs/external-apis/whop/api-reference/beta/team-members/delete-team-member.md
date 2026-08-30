---
title: "Delete Team Member"
source: "https://docs.whop.com/api-reference/beta/team-members/delete-team-member"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/team_members/{id}"
---

# Delete Team Member

> Removes a team member from the account, or revokes a pending invite when given an `ausri_` ID. A user session may delete its own membership to leave the team without the delete scope. Removing a member on the `workforce` role is also allowed with the `bounty:create` scope. The account owner cannot be removed.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`DELETE /team_members/{id}`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#delete-team-members-id) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)