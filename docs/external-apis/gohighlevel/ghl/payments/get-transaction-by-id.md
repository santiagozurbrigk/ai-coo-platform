---
title: "Get Transaction by ID"
source: "https://marketplace.gohighlevel.com/docs/ghl/payments/get-transaction-by-id"
seccion: "Payments > Transactions > Get Transaction by ID"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/payments/transactions/:transactionId"
---

# Get Transaction by ID

```http
GET /payments/transactions/:transactionId
```

The "Get Transaction by ID" API allows to retrieve information for a specific transaction using its unique identifier. Use this endpoint to fetch details for a single transaction based on the provided transaction ID.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **transactionId** `string` _required_ — ID of the transaction that needs to be returned

### Query parameters

- **locationId** `string` — LocationId is the id of the sub-account.
- **altId** `string` _required_ — AltId is the unique identifier e.g: location id.
- **altType** `string` _required_ — AltType is the type of identifier.

### Response (200 · application/json)

Successful response

**Schema**

- **_id** `string` _required_ — The unique identifier for the transaction.
- **altType** `string` _required_ — AltType is the type of identifier.
- **altId** `string` _required_ — AltId is the unique identifier eg: location id.
- **contactId** `string` — Contact id corresponding to the transaction.
- **contactSnapshot** `object` — Contact details of the transaction.
- **currency** `string` — Currency in which transaction was made.
- **amount** `number` — Transaction value.
- **status** `object` — Transaction status.
- **liveMode** `boolean` — Transaction is in live / test mode.
- **createdAt** `string<date-time>` _required_ — The creation timestamp of the transaction.
- **updatedAt** `string<date-time>` _required_ — The last update timestamp of the transaction.
- **entityType** `string` — Entity type of transaction (eg: order).
- **entityId** `string` — Entity id for the transaction. e.g: order id
- **entitySource** `object` — Entity source details for the transaction.
- **chargeId** `string` — Charge id for transaction.
- **chargeSnapshot** `object` — Charge snapshot of transaction.
- **invoiceId** `string` — Invoice id for the transaction.
- **subscriptionId** `string` — Subscription id for transaction.
- **paymentProvider** `object` — Payment provider details of the transaction.
- **ipAddress** `string` — Ip address from where transaction was initiated.
- **meta** `object` — Meta details of the transaction.
- **markAsTest** `boolean` — Is test transaction.
- **isParent** `boolean` — Is parent transaction.
- **amountRefunded** `number` — Transaction amount refunded.
- **receiptId** `string` — Receipt id for transaction.
- **qboSynced** `boolean` — Is transaction qbo synced.
- **qboResponse** `object` — Qbo details of the transaction.
- **traceId** `string` — Trace id of the transaction.
- **mergedFromContactId** `string` — ID of the contact that was merged from.
- **createdBy** `string` — User ID who created the transaction.

```json
{
  "_id": "61dd0feac077f72010f78804",
  "altType": "location",
  "altId": "3SwdhCu3svxI8AKsPJt6",
  "contactId": "XPLSw2SVagl12LMDeTmQ",
  "contactSnapshot": "{ last_name: \"Mcclain\", type: \"lead\", first_name_lower_case: \"rogan\", email: \"[email protected]\", last_name_lower_case: \"mcclain\", location_id: \"o6241QsiRwUIJHyjuhos\", company_name: \"Jordan and Cox Trading\"}",
  "currency": "USD",
  "amount": "100",
  "status": "succeeded",
  "liveMode": "false",
  "createdAt": "2023-11-20T10:23:36.515Z",
  "updatedAt": "2024-01-23T09:57:04.846Z",
  "entityType": "order",
  "entityId": "61dd0fe9c077f73e67f78803",
  "entitySource": "{ type: \"funnel\", id: \"BDBMEghdIUaqMPEsK349\", subType: \"two_step_order_form\", name: \"new funnel\" }",
  "chargeId": "in_1KGcXDCScnf89tZohCsmImwE",
  "chargeSnapshot": "{ id: \"in_1KGcXDCScnf89tZohCsmImwE\", object: \"invoice\", account_country: \"US\",  account_name:  \"GHL-Testing\" }",
  "invoiceId": "in_1KGcXDCScnf89tZohCsmImwE",
  "subscriptionId": "sub_1KGcXDCScnf89tZoVkoEMCEL",
  "paymentProvider": "{ type: \"stripe\", connectedAccount: { _id: \"612ca676b484b241fef9d962\", accountId: \"acct_1Ihw53CScnf89tZo\" } }",
  "ipAddress": "107.178.194.224",
  "meta": "{ stepId: \"af7c731e-e36f-4152-bd1a-3f69a31d6d6d\", pageId: \"A8ltotc2jZxurJba4e3Y\", pageUrl: \"/v2/preview/A8ltotc2jZxurJba4e3Y\" }",
  "markAsTest": "false",
  "isParent": "false",
  "amountRefunded": "10",
  "receiptId": "6492fbea489bc07892c6defb",
  "qboSynced": "false",
  "qboResponse": "{ domain: \"QBO\", sparse: false, Id: \"180\", SyncToken: \"0\", TotalAmt: 25 }",
  "traceId": "d3b16a92-a8ed-4e6b-8467-844750f78ed5",
  "mergedFromContactId": "XPLSw2SVagl12LMDeTmQ",
  "createdBy": "user123"
}
```
