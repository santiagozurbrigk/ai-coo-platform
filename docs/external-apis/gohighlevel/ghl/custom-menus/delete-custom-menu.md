---
title: "Delete Custom Menu Link"
source: "https://marketplace.gohighlevel.com/docs/ghl/custom-menus/delete-custom-menu"
seccion: "Custom menus > Custom Menu Links > Delete Custom Menu Link"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/custom-menus/:customMenuId"
---

# Delete Custom Menu Link

```http
DELETE /custom-menus/:customMenuId
```

Removes a specific custom menu from the system. This operation requires authentication and proper permissions. The custom menu is identified by its unique ID, and the operation is performed within the context of a specific company.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **customMenuId** `string` _required_ — ID of the custom menu to delete

### Response (200 · application/json)

Custom menu successfully deleted

**Schema**

- **success** `boolean` — Indicates whether the custom menu was successfully deleted
- **message** `string` — A message providing additional information about the deletion operation
- **deletedMenuId** `string` — The ID of the deleted custom menu
- **deletedAt** `string<date-time>` — Timestamp of when the deletion was performed

```json
{
  "success": true,
  "message": "Custom menu successfully deleted",
  "deletedMenuId": "12345abcde",
  "deletedAt": "2023-09-12T15:30:45.123Z"
}
```
