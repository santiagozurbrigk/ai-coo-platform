---
title: "API Playground"
source: "https://commasdocs.com/api/playground"
seccion: "Herramientas y referencia"
ancla: "#api-playground"
capturado: "2026-08-30"
---

TOOLS

# API Playground

Test any Commas API endpoint directly from these docs. Enter your API key, pick an endpoint, fill in the parameters, and hit Send. No terminal, no Postman — just click and go.

API Key Bar

🔑 API Key

Environment Toggle

Environment

Sandbox

Production

⚠ You're pointing at live data

Endpoint Picker

### Choose an Endpoint

Checkout Sessions

POST

Create Session — Subscription

/public-api/checkout-sessions

POST

Create Session — One-Time (Reusable)

/public-api/checkout-sessions

POST

Create Session — One-Time (Single-Buyer)

/public-api/checkout-sessions

POST

Embedded Checkout

/public-api/checkout-sessions/embedded

PATCH

Update Embedded Checkout

/public-api/checkout-sessions/embedded/:checkoutSessionId

GET

Get Session

/public-api/checkout-sessions/:checkoutSessionId

DELETE

Delete Session

/public-api/checkout-sessions/:checkoutSessionId

Webhooks

GET

List Webhooks

/public-api/webhook-subscriptions

POST

Create Webhook

/public-api/webhook-subscriptions

DELETE

Delete Webhook

/public-api/webhook-subscriptions/:webhookSubscriptionId

POST

Test Webhook

/public-api/webhook-subscriptions/:webhookSubscriptionId/test

Customers

GET

List Customers

/public-api/customers

GET

Payment Methods

/public-api/customers/:customerId/payment-methods

POST

Charge Customer

/public-api/customers/:customerId/charge

Subscribers

GET

List Subscribers

/public-api/subscribers

GET

Session Subscriptions

/public-api/checkout-sessions/:checkoutSessionId/subscriptions

GET

Product Subscriptions

/public-api/products/:productId/subscriptions

DELETE

Cancel Subscription

/public-api/checkout-sessions/:checkoutSessionId/subscriptions/:subscriptionId

POST

Refund Transaction

/public-api/checkout-sessions/transactions/:transactionId/refund

POST

Extend Subscription

/public-api/checkout-sessions/:checkoutSessionId/extend-subscription

Subscription Proration

GET

Get Available Upgrades

/api/seller/v1/subscriptions/:id/upgrades

GET

Preview Upgrade

/api/seller/v1/subscriptions/:id/upgrade/preview

POST

Process Upgrade

/api/seller/v1/subscriptions/:id/upgrade

Discount Codes

GET

List Codes

/public-api/discount-codes

POST

Create Code

/public-api/discount-codes

GET

Get Code

/public-api/discount-codes/:id

PUT

Update Code

/public-api/discount-codes/:id

DELETE

Delete Code

/public-api/discount-codes/:id

Products

GET

List Products

/public-api/products

Transactions

GET

Get Transaction

/public-api/transactions/:transactionId

GET

All Transactions

/public-api/checkout-sessions/transactions

Request Builder

Request Body (JSON)

Response Panel

```
⎘ Copy
```

History

Recent Requests

No requests yet — pick an endpoint above and hit Send.
