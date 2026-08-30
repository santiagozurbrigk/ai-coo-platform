---
title: "Troubleshooting"
source: "https://commasdocs.com/#sdk-troubleshooting"
seccion: "SDK de checkout"
ancla: "#sdk-troubleshooting"
capturado: "2026-08-30"
---

DEVELOPER RESOURCES

# Troubleshooting

#### CriticalCheckout stuck on "processing" after successful payment

**This is the #1 support issue.**

**Symptoms:** After clicking "Purchase," the checkout shows a spinning state indefinitely. The transaction succeeds (visible on the dashboard), but the user sees no confirmation.

**Root cause:** No `redirectSettings` configured (or `always_redirect` is missing/falsy), AND no `checkout:success` event handler.

**Fix:** Always configure both `redirectSettings` and a `checkout:success` handler as a fallback.

#### CriticalEvents not firing

**Symptoms:** `checkout:success`, `checkout:error`, or other events never fire even though the checkout completes or errors.

- Event listeners registered AFTER `checkout.init()` — they must be registered before `init()`.
- Event name typo — names are case-sensitive and colon-separated. It's `checkout:success`, not `checkout:Success` or `checkoutSuccess`.
- Multiple checkout instances — handlers only fire on the instance they're registered on.

#### Warningproduct_layout: 'above' renders products below

**Symptoms:** Setting `product_layout: 'above'` places product info below the form instead of above.

**Root cause:** Bug in the embedded checkout frontend. Happens primarily when the container is narrower than 600px.

**Workarounds:** Use `'left'` instead, ensure container width > 600px, or set `show_product_info: false` and render product info in the parent page.

#### WarningGHL two-column layout squeezes checkout

**Symptoms:** In GoHighLevel, placing the checkout in a two-column row results in a ~573px container with cramped layout.

**Fix:** Use a full-width row, or set explicit width with centering on `#fanbasis-wrapper`.

#### WarningIframe styles not applying

**What works:**

- `border-radius` on the iframe element itself
- Width/height on the iframe with `!important`

**What doesn't:** Styling elements _inside_ the iframe from the parent page; custom fonts from the parent (iframe loads its own).

#### WarningAddons load pre-selected

**Root cause:** `bumpProductIds` is included in config. Dashboard bumps default to ON inside the iframe.

**Fix:** Replace `bumpProductIds` with `showAllAddons: true` — addons then load unselected and toggleable. See [Addons & order bumps](#sdk-addons).

#### WarningOrder bumps don't render at all

**Root cause:** Addons aren't associated with the main product in the dashboard, or `showAllAddons` is missing from config.

**Fix:** Confirm the addons are associated with the main product in the Commas dashboard, then add `showAllAddons: true` to your config.

#### Warning"Creator does not exist" error

- Wrong `environment` — using `'qa'` instead of `'sandbox'`.
- Wrong `creatorId` — slug doesn't match the creator in Commas.
- Mismatched environment — production secret with `environment: 'sandbox'`, or vice versa.

#### WarningPaymentCheckout is undefined

- The CDN script hasn't finished loading. Wrap your code in `DOMContentLoaded`.
- The script tag is placed after your JS code. Move the CDN `<script>` tag before your init code.
- Network issue loading the CDN script. Check console for failed requests.

#### MinorCheckout loads but looks wrong / too small

**Fix:** The container needs explicit width and height. For page builders, use CSS with `!important`:

```
#checkout-container { width: 98%; height: 1100px; }
#checkout-container iframe { width: 98% !important; height: 1100px !important; }
```

#### MinorInvalid layout value

The `product_layout` config only accepts `'left'` or `'above'`. Anything else silently falls back to the default. To hide product info entirely, set `show_product_info: false`.
