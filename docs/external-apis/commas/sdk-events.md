---
title: "Events Reference"
source: "https://commasdocs.com/#sdk-events"
seccion: "SDK de checkout"
ancla: "#sdk-events"
capturado: "2026-08-30"
---

DEVELOPER RESOURCES

# Events Reference

The SDK uses a colon-separated event naming convention. **Event names are case-sensitive.**

### All events

| Event | Data | When it fires |
| --- | --- | --- |
| `checkout:opened` | — | Checkout iframe opened/visible |
| `checkout:loaded` | — | Checkout fully rendered and ready |
| `checkout:closed` | — | Checkout iframe closed/removed |
| `checkout:success` | `{ transactionId, amount, currency, customer, metadata }` | Payment completed successfully |
| `checkout:error` | `PaymentError` instance with `.code`, `.message`, `.details` | Integration-level error (config, iframe state) |
| `form:ready` | `{ timestamp }` | Form is interactive, can accept input |
| `form:submitting` | `{ paymentMethod, timestamp, timestamp_iso? }` | Form submission in progress |
| `form:submission_error` | `{ type, timestamp, data: { errorCode, errorMessage, retryable } }` | Gateway declined or errored the payment |
| `form:validation` | `{ isValid, fields: Record<string, { valid, error }> }` | Per-field validation status updated |
| `addons:changed` | `{ selectedAddons: string[], addons: Addon[] }` | Addon selection changed |
| `coupon:applied` | `{ code, discountAmount, newTotal }` | A coupon was applied successfully |
| `coupon:error` | `{ code, error }` | A coupon failed to apply (invalid, expired, etc.) |
| `field:value` | `{ field, value }` | Field value changed (setter or user input) |

⚠ Critical

Register all event handlers **BEFORE** calling `checkout.init()`. Handlers registered after `init()` may never fire.

### Registration order

```
var checkout = PaymentCheckout.create(config);   // synchronous — no await
checkout.attachToElement(element);
 
// ✅ Register events HERE — between attachToElement() and init()
checkout.on('checkout:success', handler);
checkout.on('checkout:error', handler);
checkout.on('form:submission_error', handler);
 
checkout.init();   // returns a Promise that resolves when iframe is ready
```

### checkout:success payload

The `customer` field is an object containing buyer information; `metadata` is whatever you passed in `CheckoutConfig.metadata`. Buyer email lives at `data.customer?.email`, not at the top level.

```js
checkout.on('checkout:success', function (data) {
  // data.transactionId, data.amount, data.currency
  // data.customer  → buyer info (email, name, etc.)
  // data.metadata  → whatever you passed in config.metadata
  var buyerEmail = data.customer && data.customer.email;
  console.log('Paid:', data.transactionId, buyerEmail);
});
```

### Two error categories

The SDK surfaces two distinct kinds of errors. Don't conflate them.

#### SDKIntegration errors — `checkout:error`

Emitted when something is wrong with how the SDK is configured or being called. These are **integration bugs** — surface them in dev tooling, not to end users. The payload is a `PaymentError` instance with a `code` field from the `PaymentErrorCode` enum.

| Code | Meaning |
| --- | --- |
| `INVALID_CONFIG` | Config object failed validation |
| `CREATOR_ID_REQUIRED` | `creatorId` missing |
| `PRODUCT_ID_REQUIRED` | `productId` missing |
| `CHECKOUT_SESSION_SECRET_REQUIRED` | `checkoutSessionSecret` missing |
| `FIELD_VALIDATION_ERROR` | A `setEmail/setPhone/etc.` call rejected a value |
| `FIELD_NOT_SETTABLE` | Tried to set a field that's hidden or in an invalid state |
| `IFRAME_NOT_READY` | Called a method before the iframe was ready (e.g. `setEmail` before `form:ready`) |
| `UNKNOWN_ERROR` | Catch-all |

#### GatewayPayment gateway errors — `form:submission_error`

Emitted when the payment processor declines or errors a transaction. The `errorMessage` string is already buyer-friendly — surface it directly. Use `errorCode` for analytics and retry logic; `retryable: true` means it's worth letting the user try again with the same card.

| Code | Meaning |
| --- | --- |
| `card_declined` | Card declined by the issuing bank |
| `insufficient_funds` | Insufficient funds on the card |
| `expired_card` | Card is expired |
| `invalid_card` | Card number is invalid |
| `incorrect_cvc` | CVC doesn't match |
| `processing_error` | Generic processor error |
| `network_error` | Network connectivity issue |
| `session_expired` | Checkout session has expired |
| `authentication_required` | 3DS challenge required and failed |
| `do_not_honor` | Issuing bank refused without specific reason |

```js
// Integration error — log it, fix the bug
checkout.on('checkout:error', function (err) {
  console.error('[SDK]', err.code, err.message);
});
 
// Gateway error — show errorMessage to the buyer
checkout.on('form:submission_error', function (data) {
  showErrorBanner(data.data.errorMessage);    // already user-friendly
  if (data.data.retryable) {
    enableRetryButton();
  }
});
```
