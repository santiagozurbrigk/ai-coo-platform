---
title: "Delete message"
source: "https://docs.whop.com/api-reference/messages/delete-message"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/messages/{id}"
---

# Delete message

> Permanently delete a message from an experience chat, DM, or group chat channel. Only the message author or a channel admin can delete a message.

Required permissions (one of):
 - `chat:message:create` and `chat:read`
 - `dms:message:manage` and `dms:read`
 - `livestream:chat:write` and `livestream:chat:read`
 - `support_chat:message:create` and `support_chat:read`



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`DELETE /messages/{id}`** — ver [ENDPOINTS-api-v1-stable.md](../../ENDPOINTS-api-v1-stable.md#delete-messages-id) · spec: [`openapi/api-v1-stable.json`](../../openapi/api-v1-stable.json)