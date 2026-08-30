---
title: "Migration Guide"
source: "https://commasdocs.com/#sdk-migration"
seccion: "SDK de checkout"
ancla: "#sdk-migration"
capturado: "2026-08-30"
---

DEVELOPER RESOURCES

# Migration Guide

Documenting `@fanbasis/checkout-core@0.5.0` and `@fanbasis/checkout-react@0.4.0`.

### Upgrading to 0.4.0

**New capabilities (no breaking changes):**

- `prefill: PrefillConfig` in theme config — pre-populate email, name, phone, address. See [Prefill & Field Control](#sdk-prefill).
- `fields: FieldsConfig` in theme config — hide/disable individual fields per-name.
- Field setter/getter methods on the checkout instance: `setEmail/getEmail`, `setFirstName/getFirstName`, `setLastName/getLastName`, `setPhone/getPhone`, `setAddress/getAddress`.
- New top-level config fields: `collectPhone`, `metadata`, `showAllAddons`, `overrideBaseUrl`.
- New theme params: `coupon_row_disclaimer`, `product_image`, `show_headings`, `show_powered_by`.
- New events: `form:validation`, `field:value`.
- New methods: `cleanup()`, `static fromElement()`, `updateTheme()`, `isFormReady()`.
- New utility exports: `createMinimalConfig`, `validateConfig`, `mergeConfig`, `isConfigComplete`, `getConfigSummary`.

### Deprecations

| Deprecated | Replacement |
| --- | --- |
| `billing_display_fields: string[]` (in theme) | `fields: FieldsConfig` for per-field hide/disable |

### Important: corrections to old patterns

If you're migrating from older code samples or tutorials on the internet, watch for these stale patterns:

#### Stale`await PaymentCheckout.create(config)`

**Wrong.** `PaymentCheckout.create()` is synchronous and returns the instance directly. Only `init()` returns a Promise.

```js
const checkout = PaymentCheckout.create(config);   // synchronous
checkout.attachToElement(element);
checkout.on('checkout:success', handler);
await checkout.init();                              // async
```

#### Stale`environment: 'qa'`

**Wrong.** The valid values are `'sandbox'` and `'production'`. `'qa'` was renamed to `'sandbox'`.

#### Stale`data.customerEmail` on `checkout:success`

**Wrong.** The success payload is `{ transactionId, amount, currency, customer, metadata }`. There is no top-level `customerEmail` — buyer email lives at `data.customer?.email`.

#### Stale`addons:changed` shape with `total` / `name` / `selected`

**Wrong.** The current shape is `{ selectedAddons: string[], addons: Addon[] }`, where each `Addon` has `{ id, title, price, description, subscription_details? }`. There is no `total`, no `name`, and no `selected` boolean — derive selection from `selectedAddons.includes(addon.id)`.

#### Stale`CheckoutState` shape

**Wrong.** Old docs claim `{ isLoaded, isSubmitting, isComplete, error }`. The actual shape is `{ isOpen, isLoading, isInitialized, error }`.

#### StaleError codes `PAYMENT_FAILED`, `CARD_DECLINED` on `checkout:error`

**Wrong category.** `PaymentErrorCode` covers integration errors only (`INVALID_CONFIG`, `CREATOR_ID_REQUIRED`, etc.). Gateway/payment errors like `card_declined` come through `form:submission_error` as lowercase strings on `data.errorCode`. See [Events Reference](#sdk-events).

### Historical: v0.0.x → v0.1.x

Long-deprecated patterns. Skip this section unless you're maintaining very old code.

- `checkout.mount('#container')` → `checkout.attachToElement(element)`
- camelCase events (`checkoutSuccess`) → colon-separated (`checkout:success`)
- `redirectUrl` string → `redirectSettings` object
- `init()` required as a separate step after attaching
