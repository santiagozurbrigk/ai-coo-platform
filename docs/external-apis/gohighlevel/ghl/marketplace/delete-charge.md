---
title: "Delete a wallet charge"
source: "https://marketplace.gohighlevel.com/docs/ghl/marketplace/delete-charge"
seccion: "Developer marketplace > Wallet Charges > Delete a wallet charge"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/marketplace/billing/charges/:chargeId"
---

# Delete a wallet charge

```http
DELETE /marketplace/billing/charges/:chargeId
```

Delete a wallet charge

## Request

### Path parameters

- **chargeId** `string` _required_ — ID of the charge to delete

### Response (200 · application/json)

Charge deleted successfully

**Schema**

- **success** `boolean` — Indicates whether the charge was deleted successfully

```json
{
  "success": true
}
```
