---
title: "Get Subscription by ID"
source: "https://marketplace.gohighlevel.com/docs/ghl/payments/get-subscription-by-id"
seccion: "Payments > Subscriptions > Get Subscription by ID"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/payments/subscriptions/:subscriptionId"
---

# Get Subscription by ID

```http
GET /payments/subscriptions/:subscriptionId
```

The "Get Subscription by ID" API allows to retrieve information for a specific subscription using its unique identifier. Use this endpoint to fetch details for a single subscription based on the provided subscription ID.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **subscriptionId** `string` _required_ — ID of the subscription that needs to be returned

### Query parameters

- **altId** `string` _required_ — AltId is the unique identifier e.g: location id.
- **altType** `string` _required_ — AltType is the type of identifier.
  - Available options: `location`

### Response (200 · application/json)

Successful response

**Schema**

- **_id** `string` _required_ — The unique identifier for the subscription.
- **altType** `object` _required_ — AltType is the type of identifier.
- **altId** `string` _required_ — AltId is the unique identifier eg: location id.
- **contactId** `string` — Contact id corresponding to the subscription.
- **contactSnapshot** `object` — Contact details of the subscriber.
- **coupon** `object` — Coupon details of the subscription.
- **currency** `string` — Currency in which subscription was made.
- **amount** `number` — Subscription value.
- **status** `object` — Subscription status.
- **liveMode** `boolean` — Subscription is in live / test mode.
- **entityType** `string` — Entity type of subscription (eg: order).
- **entityId** `string` — Entity id for the subscription. e.g: order id
- **entitySource** `object` — Entity source details for the subscription.
- **subscriptionId** `string` — Subscription id for subscription.
- **subscriptionSnapshot** `object` — Snapshot of subscription.
- **paymentProvider** `object` — Payment provider details for the subscription.
- **ipAddress** `string` — Ip address from where subscription was initiated.
- **createdAt** `string<date-time>` _required_ — The creation timestamp of the subscription.
- **updatedAt** `string<date-time>` _required_ — The last update timestamp of the subscription.
- **meta** `object` — Meta details of the subscription.
- **markAsTest** `boolean` — Is test subscription.
- **schedule** `object` — Scedule details for the subscription.
- **autoPayment** `object` — Auto payment details of the subscription.
- **recurringProduct** `object` — Recurring product details of the subscription.
- **canceledAt** `string<date-time>` — Cancellation timestamp of the subscription.
- **canceledBy** `string` — User id who cancelled the subscription.
- **traceId** `string` — Trace id of the subscription.
- **createdBy** `string` — User ID who created the subscription.

```json
{
  "_id": "64bf78af39118e4011926cba",
  "altType": "location",
  "altId": "3SwdhCu3svxI8AKsPJt6",
  "contactId": "XPLSw2SVagl12LMDeTmQ",
  "contactSnapshot": "{ last_name: \"Mcclain\", type: \"lead\", first_name_lower_case: \"rogan\", email: \"[email protected]\", last_name_lower_case: \"mcclain\", location_id: \"o6241QsiRwUIJHyjuhos\", company_name: \"Jordan and Cox Trading\"}",
  "coupon": "{ _id: \"6374c6926d119a393fe1e556\", usageCount: 5260, altId: \"jVFIxsMY19D94nOSIOEO\", altType: \"location\", name: \"FREE-100%\", code: \"FREE100\", discountType: \"percentage\", discountValue: 100 }",
  "currency": "USD",
  "amount": "100",
  "status": "active",
  "liveMode": "false",
  "entityType": "order",
  "entityId": "62f4db0f3059ecee61379012",
  "entitySource": "{ type: \"funnel\", id: \"lx6ROqruHGVQD2PZwFxK\", subType: \"upsell\", name: \"test funnel\" }",
  "subscriptionId": "I-0UE609H8E43P",
  "subscriptionSnapshot": "{ status: \"ACTIVE\", status_update_time: \"2022-08-16T11:06:53Z\", id: \"I-0UE609H8E43P\", plan_id: \"P-82K11750F0313430KMLRGE6Y\", start_time: \"2022-08-16T11:05:31Z\", quantity: 1 }",
  "paymentProvider": "{ type: \"paypal\", connectedAccount: { _id: \"64410debdc8f3b0503523abb\", merchantClientId: \"AeXtjrxdgsJiCPwQt5jML5pH-0mwmLs-tH7ub4Uo3IrDKvRl34FvJy8niI6E1wmS_pryIRdNllyVl58b\" } }",
  "ipAddress": "103.100.16.82",
  "createdAt": "2023-11-20T10:23:36.515Z",
  "updatedAt": "2024-01-23T09:57:04.846Z",
  "meta": "{ collection: \"transactionsv2\", id: \"6320652f0f664b6632006920\" }",
  "markAsTest": "false",
  "schedule": "{ collection: \"transactionsv2\", id: \"6320652f0f664b6632006920\" }",
  "autoPayment": "{ customerId: \"908879612\", paymentMethodId: \"908646635\" }",
  "recurringProduct": "{ locationId: \"Z4Bxl8J4SaPEPLq9IQ8g\", funnel: \"bQHJWKcyjiKjk4BHv91g\", step: \"2281a993-8a75-4b48-9912-571f29c99a74\", name: \"Sofa Set\" }",
  "canceledAt": "2023-11-20T10:23:36.515Z",
  "canceledBy": "qUuXUiB2AiA2DIthEicP",
  "traceId": "302d2cf4-1ba0-4bf5-bc3b-f8fa76fda58a",
  "createdBy": "user123"
}
```
