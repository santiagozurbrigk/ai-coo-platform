---
title: "Identityprofile updated"
source: "https://docs.whop.com/api-reference/identity-profiles/identityprofile-updated"
capturado: "2026-08-30"
---

# Identityprofile updated

> Sent whenever an identity profile changes state — a verification is approved, needs action, or is rejected, or a Whop review opens or clears. Every other identity_profile event is also delivered as an identity_profile.updated, so you can subscribe to this single event and re-fetch the verification to read its current status.

Required permissions:
 - `identity:read`
 - `webhook_receive:identity_profiles`



## OpenAPI

_Bloque OpenAPI omitido — ver los specs en [`openapi/`](../../openapi/)._