---
title: "Get Order by ID"
source: "https://marketplace.gohighlevel.com/docs/ghl/payments/get-order-by-id"
seccion: "Payments > Orders > Get Order by ID"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/payments/orders/:orderId"
---

# Get Order by ID

```http
GET /payments/orders/:orderId
```

The "Get Order by ID" API allows to retrieve information for a specific order using its unique identifier. Use this endpoint to fetch details for a single order based on the provided order ID.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **orderId** `string` _required_ — ID of the order that needs to be returned

### Query parameters

- **locationId** `string` — LocationId is the id of the sub-account.
- **altId** `string` _required_ — AltId is the unique identifier e.g: location id.

### Response (200 · application/json)

Successful response

**Schema**

- **_id** `string` _required_ — The unique identifier for the order.
- **altId** `string` _required_ — AltId is the unique identifier eg: location id.
- **altType** `string` _required_ — AltType is the type of identifier.
- **contactId** `string` — Contact id corresponding to the order.
- **currency** `string` — Currency in which order was created.
- **amount** `number` — Order value.
- **status** `string` _required_ — The status of the order (e.g., completed).
- **liveMode** `boolean` — Order is in live / test mode.
- **createdAt** `string<date-time>` _required_ — The creation timestamp of the order.
- **updatedAt** `string<date-time>` _required_ — The last update timestamp of the order.
- **fulfillmentStatus** `string` — Fulfillment status of the order.
- **contactSnapshot** `object` — Contact details of the order.
- **amountSummary** `object` — Amount details of the order.
- **source** `object` — Source details of the order.
- **items** `string[]` — Item details of the order.
- **coupon** `object` — Coupon details of the order.
- **trackingId** `string` — Tracking id of the order.
- **fingerprint** `string` — Fingerprint id of the order.
- **meta** `object` — Meta details of the order.
- **markAsTest** `boolean` — Is test order.
- **traceId** `string` — Trace id of the order.
- **automaticTaxesCalculated** `boolean` — Automatic taxes applied for the Order
- **taxCalculationProvider** `object` — Provider name for automatic tax calculation
- **createdBy** `string` — User ID who created the order.

```json
{
  "_id": "653f5e0cde5a1314e62a837c",
  "altId": "3SwdhCu3svxI8AKsPJt6",
  "altType": "location",
  "contactId": "XPLSw2SVagl12LMDeTmQ",
  "currency": "USD",
  "amount": "100",
  "status": "completed",
  "liveMode": "false",
  "createdAt": "2023-11-20T10:23:36.515Z",
  "updatedAt": "2024-01-23T09:57:04.846Z",
  "fulfillmentStatus": "unfulfilled",
  "contactSnapshot": "{ last_name: \"Mcclain\", type: \"lead\", first_name_lower_case: \"rogan\", email: \"[email protected]\", last_name_lower_case: \"mcclain\", location_id: \"o6241QsiRwUIJHyjuhos\", company_name: \"Jordan and Cox Trading\"}",
  "amountSummary": "{ subtotal: 100, discount: 5 }",
  "source": "{ type: \"invoice\", id: \"61dd48ff65b013bc39bb09c6\" }",
  "items": "{ _id: 61dd33e88058b9f967ca79dc, authorizeAmount: 0, locationId: \"SBAWb4yu7A4LSc0skQ6g\", name: \"Sample Product\": price: {}, product: { name: \"Testing product\", productType: \"SERVICE\" }}",
  "coupon": "{ code: \"FEST10\", _id: \"63455e48901b43d4ef364a20\" }",
  "trackingId": "63319ef9-de0a-4c84-aebd-3585fb4a0cdf",
  "fingerprint": "5d51db5a-42b0-4b04-ba88-2c046c982a3a",
  "meta": "{ couponSessionExpired: true }",
  "markAsTest": "false",
  "traceId": "d3b16a92-a8ed-4e6b-8467-844750f78ed5",
  "automaticTaxesCalculated": true,
  "taxCalculationProvider": "taxjar",
  "createdBy": "user123"
}
```
