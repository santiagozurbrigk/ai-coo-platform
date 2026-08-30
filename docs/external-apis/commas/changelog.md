---
title: "Changelog"
source: "https://commasdocs.com/#changelog"
seccion: "Herramientas y referencia"
ancla: "#changelog"
capturado: "2026-08-30"
---

# Changelog

A running log of API updates, new features, and breaking changes. Subscribe to webhook event `api.changelog` (coming soon) to get notified automatically.

August 2026

Documentation Accuracy Audit — Second Pass

Improved

A second full audit of every section against the live platform, with each finding independently verified. Highlights: the transactions

`customer_id`

filter is now documented as

**failing open**

(an unrecognised id returns every transaction, not an error); cash discount codes take

`value`

in

**dollars**

; refunds require both

`amount_cents`

and

`reason`

(no full-refund default); workflow examples now use the real

`payment_link`

field; the

[AI Agent](#ai-agent)

tool table lists the real tool names; proration callers are pointed at the

**www**

host; and in-page links now keep their sub-anchor in the URL so deep links are shareable.

August 2026

Direct Product Creation & Subscription Payment Links

New

Four new capabilities across the API, MCP and CLI (commas-cli 0.4.0).

[Create a Product](#prod-create)

(

`POST /products/create`

) returns a

`product_id`

and shareable

`payment_link`

in one call — note the price is in

**dollars**

, not cents.

[Get Transactions for a Product](#prod-transactions)

gives per-product revenue.

[Subscription Payment Links](#proration-link-create)

create a full recurring offer — courses, Discord roles, order bumps and upsells attached — in one request (needs the

`subscriptions`

key scope). The CLI also gained

`subs upgrades`

/

`upgrade-preview`

/

`upgrade`

and

`checkout update-embedded`

; every server tool (38) now has a dedicated command.

August 2026

Documented Charge, Refund & Customer ID Gotchas

Improved

Three requirements that were previously only discoverable by hitting an error are now written down.

[Charge a Customer](#charge-customer)

needs the customer to have an

**authorized subscription**

— saved cards alone are not enough, and the

`404`

it returns names a missing subscription, not a bad ID.

[Saved Payment Methods](#payment-methods)

needs the numeric customer ID from the customer list; a transaction's

`fan.id`

is a different identifier and will not resolve.

[Refunds](#refunds)

of ACH/bank payments only work once the payment settles. Also noted: the proration endpoints require the

`subscriptions`

key scope.

August 2026

Commas CLI 0.2.0

Fixed

Update with

`npm install -g commas-cli@latest`

.

**Every command in 0.1.0 hung indefinitely once you were logged in**

— that is fixed, so the CLI is usable. Also fixed: commands could run against the wrong environment after an earlier

`--env sandbox`

, and a refund whose confirmation had expired reported success. Amounts written with thousands separators (

`--amount 1,299.50`

) are now read correctly rather than as $1.00, and

`--json`

always emits valid JSON.

`discounts create`

/

`update`

now send the fields the API expects (

`--type cash|percentage`

,

`--duration`

,

`--products`

), and

`checkout embedded`

takes the required

`--creator`

and

`--product`

. New:

`commas keys list`

and

`commas keys add sandbox`

register the API key an environment needs. See

[Connect to CLI](#cli)

.

August 2026

Documentation Accuracy Pass

Improved

A full accuracy audit of the API reference and SDK docs against the live platform. Corrected webhook payload shapes, error response formats, dispute lifecycle statuses, pagination parameters, and refund fields; fixed in-page navigation, search coverage, dark-mode contrast, and the embedded

**Try it**

panels.

August 2026

API Key Scopes

New

API keys now carry granular

**scopes**

. A key created with default settings has all six scopes (

`checkout-sessions`

,

`refunds`

,

`payments`

,

`webhooks`

,

`customers`

,

`subscriptions`

), so existing integrations are unaffected. Narrow a key to hand out read-only or refund-only access; a request missing the required scope is rejected with

`403`

naming the scope it needs.

August 2026

Order Bumps — showAllAddons

New

A new top-level

`showAllAddons: true`

config renders every dashboard-associated addon as a native order bump inside the embedded checkout — unselected by default and toggleable, with no parent-page UI. The older

`bumpProductIds`

option is

**deprecated**

. See

[Addons & order bumps](#sdk-addons)

.

July 2026

Commas CLI

New

Run your Commas business from the terminal — and let AI agents operate it. Install with

`npm install -g commas-cli`

, then

`commas login`

. Manage products, transactions, refunds, subscriptions, discount codes, and webhooks; every command supports

`--json`

for scripting. See

[Connect to CLI](#cli)

.

July 2026

FanBasis is now Commas

Improved

FanBasis has rebranded to

**Commas**

. Your integration is unchanged — the API base URL (

`https://www.fanbasis.com/public-api`

) and your existing API keys continue to work, so no migration is required.

May 2026

SDK 0.5.0 — Coupon Events & Programmatic Coupons

New

Update to

`@fanbasis/checkout-core@0.5.0`

and

`@fanbasis/checkout-react@0.4.0`

. Two new events —

`coupon:applied`

(

`{ code, discountAmount, newTotal }`

) and

`coupon:error`

(

`{ code, error }`

) — let you react to coupon changes, plus new

`applyCoupon(code)`

/

`removeCoupon()`

methods to apply coupons programmatically.

April 2026

SDK 0.4.0 — Prefill, Field Control & Validation Events

New

Major update to

`@fanbasis/checkout-core@0.4.0`

and

`@fanbasis/checkout-react@0.3.0`

. Native

[prefill](#sdk-prefill)

for email/name/phone/address; per-field

`hide`

/

`disable`

control via the new

`fields`

config; top-level

`collectPhone`

and

`metadata`

options; new

`form:validation`

and

`field:value`

events; setter/getter methods on the checkout instance.

April 2026

SDK Documentation Audit

Improved

Full audit of the SDK reference against the current 0.4.0 source. Corrected event payload shapes (

`checkout:success`

,

`addons:changed`

,

`form:submission_error`

),

`CheckoutState`

shape, and the

`PaymentErrorCode`

enum. Migration Guide now lists stale patterns to avoid (

`await create()`

,

`'qa'`

,

`customerEmail`

).

February 2026

AI Agent MCP Integration

New

Connect Claude, ChatGPT, or Grok directly to your Commas account via MCP. Query transactions, customers, products, and subscribers with natural language. Includes full setup guides for Claude Desktop, ChatGPT, and Grok.

February 2026

API Playground

New

Interactive API explorer built right into the docs. Test any endpoint with your API key, see real responses, and build requests without writing code. Includes request history and environment switching.

February 2026

Common Workflows Guide

New

Step-by-step guides for the five most common seller scenarios: one-time payments, recurring subscriptions, discount campaigns, refunds, and webhook automation.

February 2026

Premium Documentation Redesign

Improved

Complete UI overhaul with dark mode support, multi-language code examples (Shell, Python, Node, PHP), sidebar search, scroll animations, and a new design system inspired by the best API docs in the industry.

January 2026

Embedded Checkout

New

Embed the Commas checkout directly on your website using an iframe. No redirects needed — buyers stay on your domain for a seamless purchase experience.

January 2026

Discount Codes API

New

Full CRUD API for discount codes. Create percentage or fixed-amount discounts, set usage limits and expiration dates, and track redemptions programmatically.

January 2026

Webhook Signature Validation

Improved

Enhanced webhook security with HMAC-SHA256 signature verification. Updated docs now include validation examples in Python, Node.js, and PHP.

December 2025

Disputes & Chargebacks

New

New dispute lifecycle documentation covering chargeback notifications, evidence submission deadlines, and webhook events for real-time dispute tracking.

December 2025

Rate Limiting Update

Improved

Rate limiting now applies to the

**checkout-sessions**

and

**customers**

endpoint groups at 10,000 authenticated requests per hour. Responses from those groups carry

`X-RateLimit-Limit`

,

`X-RateLimit-Remaining`

, and

`X-RateLimit-Reset`

headers; other endpoint groups are not rate-limited and do not return the headers.
