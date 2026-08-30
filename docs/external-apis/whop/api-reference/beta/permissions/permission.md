---
title: "Permission"
source: "https://docs.whop.com/api-reference/beta/permissions/permission"
capturado: "2026-08-30"
---

# Permission

A Permission is one action, such as `stats:read`, paired with whether your credential is granted it on a given resource. It answers for whatever you authenticated with, so you can decide what to show or attempt instead of discovering a `403`.

Use the Permissions API to check an account, product, experience, or app, narrowing to the actions you care about. It reports only your own access — to manage who else can reach an account, use the Team Members API.

## Endpoints

| Endpoint                                                               | Request                                                         |
| ---------------------------------------------------------------------- | --------------------------------------------------------------- |
| [Check Permissions](/api-reference/beta/permissions/check-permissions) | <Badge color="blue" size="sm" stroke>GET</Badge> `/permissions` |
