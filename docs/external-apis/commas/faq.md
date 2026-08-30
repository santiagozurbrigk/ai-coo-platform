---
title: "Frequently Asked Questions"
source: "https://commasdocs.com/#faq"
seccion: "Herramientas y referencia"
ancla: "#faq"
capturado: "2026-08-30"
---

# Frequently Asked Questions

Answers to the most common questions about integrating with Commas. If you don't find what you need here, reach out to [support@fanbasis.com](mailto:support@fanbasis.com).

GETTING STARTED

Getting Started & Setup

**Do I need to wait for account verification before I can start integrating?**

No — you can start building right away using your **sandbox API key**. Sandbox mode works exactly like production: create checkout sessions, fire webhooks, test subscription flows. No real charges are ever made. Once your account is verified, switch to your live API key to go live.

**Where do I find my API key?**

Log into your Commas dashboard and go to the **API Keys** section. Copy your API key from there. You'll have a separate key for sandbox (test) mode and live (production) mode. Use the appropriate key for each environment.

**Can I have multiple API keys or rotate them?**

Yes. You can generate a new API key from the **API Keys** section in your Commas dashboard at any time. Once you generate a new key, the old one is invalidated. Make sure to update all your integrations before rotating. We recommend storing your key as an environment variable (e.g., `FANBASIS_API_KEY`), never in source code.

**Can I use Commas without a registered business?**

Yes. You can onboard as an individual creator or solopreneur without a registered business entity. You'll still need to complete identity verification, but you don't need formal business registration to accept payments through Commas.

PAYMENTS & CHECKOUT

Payments & Checkout

**What's the difference between a checkout session and a product?**

A **product** is a persistent item in your catalog (e.g., "Pro Membership"). A **checkout session** is a specific instance of selling something — it's the payment page you create and send to a customer. One product can have many checkout sessions. The session is what holds the price, payment type, and the resulting `payment_link` URL.

**Can I create a checkout session without adding a product in the dashboard first?**

Yes. You can pass product details (title, description) directly in the checkout session request body via the `product` object. You don't need a pre-existing product ID. This is useful for dynamic, one-off payment links.

**Can I embed the checkout directly on my website instead of redirecting customers?**

Yes — use the `POST /checkout-sessions/embedded` endpoint. Pass a `product_id` and you'll receive a `checkout_session_secret` you use to initialize the embedded checkout widget on your frontend. This keeps customers on your page throughout the payment experience.

See the [Embedded Checkout](#embedded-checkout) section for the full example.

**How do I charge a customer again without creating a new checkout session?**

Use the [Charge a Customer](#charge-customer) endpoint. If you already have a customer in Commas (they've paid before), you can charge their saved payment method directly without requiring them to go through checkout again. This is ideal for usage-based billing, one-time top-ups, or custom billing cycles.

**What happens if a checkout session expires before the customer pays?**

By default, checkout sessions expire after a set time period. Once expired, the payment link no longer works. Commas will fire a `payment.expired` webhook event. You can create a new session and send the customer a fresh link if needed. You can also delete a session manually before it expires using the Delete Checkout Session endpoint.

**Can I give a customer a discount on their checkout?**

Yes. First create a discount code using the [Discount Codes API](#discount-codes) (e.g., 20% off, or $10 off), then include the `discount_code` field in your checkout session request. The discount will automatically be applied to the customer's checkout. You can also share the code directly with customers to enter themselves at checkout.

SUBSCRIPTIONS

Subscriptions & Billing

**How do I set up a recurring subscription?**

When creating a checkout session, set `"type": "subscription"` and include a `subscription` object with `frequency_days` (how often to bill, e.g., `30` for monthly) and optionally `auto_expire_after_x_periods` if you want the subscription to end after a fixed number of renewals.

Once the customer pays, Commas automatically handles recurring billing on the schedule you set. Listen for `subscription.renewed` webhooks to track each renewal.

**Can I extend a subscription's end date?**

Yes. Use the [Extend Subscription](#extend-subscription) endpoint and pass a `user_id` and `duration_days` value. This is useful for offering free trial extensions, compensating customers for downtime, or adding bonus access as a reward.

**What happens to a subscriber's data when I cancel their subscription?**

Canceling a subscription stops future billing — but the customer's record is preserved in Commas. The subscription record, transaction history, and customer profile remain accessible through the API. Commas fires a `subscription.canceled` webhook event, which you can use to revoke access in your own system.

**Can customers manage or cancel their own subscriptions?**

Subscription management is currently handled through the Commas dashboard or via the API. If you want customers to be able to cancel themselves, you can build a self-service portal that calls the Cancel Subscription endpoint on the customer's behalf (using your API key server-side, never in the browser).

WEBHOOKS

Webhooks

**How do I know a webhook actually came from Commas?**

Each webhook request includes a signature in the headers. Compute an HMAC-SHA256 hash of the raw request body using your webhook secret and compare it to the signature header. If they match, the request is genuine. If not, discard it — it wasn't sent by Commas.

Never skip signature verification in production, even if the request looks legitimate.

**My webhook endpoint is receiving events, but my server keeps timing out. What should I do?**

Commas expects an HTTP `200` response within a few seconds of delivery. If your handler performs slow operations (database writes, email sends, external API calls), move that work to a background job and return 200 immediately. Example pattern:

- Receive webhook POST → validate signature → enqueue a background job → return 200
- Background job processes the event asynchronously

This prevents timeouts. It matters more than it sounds: delivery is at-most-once, so an event your handler times out on is logged as failed and never sent again.

**Can I test webhooks without a publicly accessible server?**

Yes — use a tunneling tool like **ngrok** or **cloudflared tunnel** to expose your local server to the internet during development. Run ngrok, get a public URL (e.g., `https://abc123.ngrok.io`), register it as your webhook URL in Commas, and use the Test Webhook endpoint to fire a simulated event to it.

**What happens if Commas can't reach my webhook endpoint?**

Delivery is **at-most-once**. If your endpoint is unreachable, times out, or returns a non-2xx status, the failure is logged and the event is **never retried** — there is no exponential-backoff schedule and no redelivery queue. Make sure your endpoint is reliable and returns 200 promptly, and reconcile any gap against the API rather than waiting for a redelivery: `GET /public-api/checkout-sessions/transactions` for payments, plus the subscribers and transaction endpoints for the rest. Check the webhook subscription status in your dashboard for delivery error logs.
