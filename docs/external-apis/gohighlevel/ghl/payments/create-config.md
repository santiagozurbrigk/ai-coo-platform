---
title: "Create new provider config"
source: "https://marketplace.gohighlevel.com/docs/ghl/payments/create-config"
seccion: "Payments > Custom Provider > Create new provider config"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/payments/custom-provider/connect"
---

# Create new provider config

```http
POST /payments/custom-provider/connect
```

API to create a new payment config for given location

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location id

### Request body (application/json)

**Body required**

- **live** `object` _required_ — Live config containing api-key and publishable key for live payments
- **test** `object` _required_ — Test config containing api-key and publishable-key for test payments

```json
{
  "live": {
    "apiKey": "y5ZQxryRFXZHvUJZdLeXXXXX",
    "publishableKey": "rzp_test_zPRoVMLOa0XXXX"
  },
  "test": {
    "apiKey": "y5ZQxryRFXZHvUJZdLeXXXXX",
    "publishableKey": "rzp_test_zPRoVMLOa0XXXX"
  }
}
```

### Response (200 · application/json)

Successful response

**Schema**

- **name** `string` _required_ — The name of the custom provider
- **description** `string` _required_ — Description of payment gateway. Shown on the payments integrations page as subtext
- **paymentsUrl** `string` _required_ — This url will be loaded in iFrame to start a payment session.
- **queryUrl** `string` _required_ — The url used for querying payments related events. Ex. verify, refund, subscription etc.
- **imageUrl** `string` _required_ — Public image url for logo of the payment gateway displayed on the payments integrations page.
- **_id** `string` _required_ — The unique identifier for the custom provider.
- **locationId** `string` _required_ — Location id
- **marketplaceAppId** `string` _required_ — The application id of marketplace
- **paymentProvider** `object` — Payment provider details.
- **deleted** `boolean` _required_ — Whether the config is deleted or not. true represents config is deleted
- **createdAt** `string<date-time>` _required_ — The creation timestamp of the custom provider.
- **updatedAt** `string<date-time>` _required_ — The last update timestamp of the custom provider.
- **traceId** `string` — Trace id of the custom provider.

```json
{
  "name": "Company Paypal Integration",
  "description": "This payment gateway supports payments in India via UPI, Net banking, cards and wallets.",
  "paymentsUrl": "https://testpayment.paypal.com",
  "queryUrl": "https://testsubscription.paypal.com",
  "imageUrl": "https://testsubscription.paypal.com",
  "_id": "662a44ad19a2a44d3cd9d749",
  "locationId": "Lk3nlfk4lxlelVEwcW",
  "marketplaceAppId": "65f0b217a05c774da7f1efa5",
  "paymentProvider": "{ live: { liveMode: true }, test: { liveMode: false, apiKey: \"y5ZQxryRFXZHvUJZdLXXXXXX\", publishableKey: \"rzp_test_zPRoVMLOa0A9wo\" }}",
  "deleted": true,
  "createdAt": "2023-11-20T10:23:36.515Z",
  "updatedAt": "2024-01-23T09:57:04.846Z",
  "traceId": "302d2cf4-1ba0-4bf5-bc3b-f8fa76fda58a"
}
```
