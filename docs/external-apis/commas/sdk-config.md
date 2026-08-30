---
title: "Configuration Reference"
source: "https://commasdocs.com/#sdk-config"
seccion: "SDK de checkout"
ancla: "#sdk-config"
capturado: "2026-08-30"
---

DEVELOPER RESOURCES

# Configuration Reference

### Required fields

```
interface CheckoutConfig {
  creatorId: string;              // Your creator's URL slug
  productId: string;              // Product ID from the dashboard
  checkoutSessionSecret: string;  // Session secret from the API
  environment: 'sandbox' | 'production';
}
```

⚠ Environment values

The SDK only accepts `'sandbox'` and `'production'`. Do **NOT** use `'qa'` — it will cause a "creator does not exist" error.

### Optional fields

```
interface CheckoutConfig {
  // ... required fields above
 
  // Behavior
  bumpProductIds?: string[];               // DEPRECATED — use showAllAddons (see Addons)
  couponCode?: string;                     // pre-apply a coupon at checkout
  affiliateCode?: string;                  // attribute the sale to an affiliate
  metadata?: Record<string, string>;       // pass-through metadata stored on the txn
  collectPhone?: boolean;                  // show phone field with country code selector
  showAllAddons?: boolean;                 // render all dashboard addons as order bumps
  showSubmitButton?: boolean;              // default: true. Set false for custom submit button.
 
  // Lifecycle / rendering
  redirectSettings?: RedirectSettings;
  containerOptions?: { width?: string; height?: string };
  theme?: CustomizationParams;             // Styling, layout, prefill, fields
  overrideBaseUrl?: string;                // override embedded checkout host (rarely needed)
}
```

### Order bump fields

| Field | Type | Default | Notes |
| --- | --- | --- | --- |
| `showAllAddons` | `boolean` | `false` | Renders all dashboard-associated addons, unselected and toggleable inside the iframe. Use this for order bumps. Top-level config field — not inside `theme`. |
| `bumpProductIds` | `string[]` | — | **Deprecated.** Loads addons pre-selected; deselecting removes them from the order. Use `showAllAddons`. See [Addons & order bumps](#sdk-addons). |

### Runtime validation

The SDK runtime-validates the three required identifiers at `PaymentCheckout.create()` time and throws a `PaymentError` with the corresponding code if any are missing:

| Missing field | Error code thrown |
| --- | --- |
| `creatorId` | `CREATOR_ID_REQUIRED` |
| `productId` | `PRODUCT_ID_REQUIRED` |
| `checkoutSessionSecret` | `CHECKOUT_SESSION_SECRET_REQUIRED` |

Other config fields are TypeScript-required (compile-time) but not runtime-validated — passing an unknown `product_layout` value, for example, will silently fall back to the default rather than throw.
