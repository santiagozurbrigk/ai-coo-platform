---
title: "Addons & Order Bumps"
source: "https://commasdocs.com/#sdk-addons"
seccion: "SDK de checkout"
ancla: "#sdk-addons"
capturado: "2026-08-30"
---

DEVELOPER RESOURCES

# Addons & Order Bumps

Commas checkout supports **addons** (order bumps) that customers can toggle on and off during checkout. The simplest and recommended way to offer them is `showAllAddons` — one top-level config flag that renders every addon natively inside the iframe.

✓ Recommended: showAllAddons

Set `showAllAddons: true` at the **top level** of your config — not inside `theme`. No parent-page checkboxes and no addon method calls: the iframe renders and manages the bumps for you.

```js
const config = {
  creatorId: 'your-creator-slug',
  productId: 'YOUR_MAIN_PRODUCT_ID',
  checkoutSessionSecret: 'your-session-secret-uuid',
  environment: 'production',
  showAllAddons: true,
  theme: { /* ... */ }
};
```

This renders every addon associated with the main product in the dashboard:

- **Unselected by default** — nothing is added to the total until the customer opts in.
- **Toggleable natively inside the iframe** — no parent-page UI required.
- **Deselecting returns the addon to unchecked** — it stays in the order, it does not disappear.

✓ Prerequisite

Addons must be **associated with the main product in the Commas dashboard**. That is the only way to bind them — there is no API for it, and `POST /checkout-sessions/embedded` has no addon parameter.

### bumpProductIds is deprecated

`bumpProductIds` loads addons **pre-selected**, and deselecting one removes it from the order entirely instead of just unchecking it. Replace it with `showAllAddons` — a two-line migration:

```
- bumpProductIds: ["ADDON_PRODUCT_ID"],
+ showAllAddons: true,
```

### Advanced: programmatic control

Only if you need a **custom order-bump UI in the parent page** instead of the iframe's native rendering: omit `showAllAddons` and drive addons explicitly with `addAddon()` / `removeAddon()` from your own checkboxes. These methods are deterministic — prefer them over `toggleAddon()` when setting initial state. Bump products must still be associated with the main product in the dashboard.

```js
// Config — omit both showAllAddons and bumpProductIds
var config = {
  creatorId: 'REPLACE_CREATOR_SLUG',
  productId: 'REPLACE_MAIN_PRODUCT_ID',
  checkoutSessionSecret: 'REPLACE_SESSION_SECRET',
  environment: 'production',
  redirectSettings: {
    success_redirect_url: 'https://yoursite.com/thank-you',
    always_redirect: true
  }
};
 
var checkout = PaymentCheckout.create(config);
checkout.attachToElement(element);
 
// Parent-page checkbox handler — use addAddon/removeAddon, NOT toggleAddon
checkbox.addEventListener('change', function () {
  if (this.checked) {
    checkout.addAddon('REPLACE_BUMP_PRODUCT_ID');
  } else {
    checkout.removeAddon('REPLACE_BUMP_PRODUCT_ID');
  }
});
 
// Sync parent-page UI from the addons:changed event
checkout.on('addons:changed', function (data) {
  // data: { selectedAddons: string[], addons: Addon[] }
  // (no `total` field — compute it yourself from selectedAddons + addon prices)
  data.addons.forEach(function (addon) {
    var box = document.querySelector('[data-addon-id="' + addon.id + '"]');
    if (box) box.checked = data.selectedAddons.indexOf(addon.id) !== -1;
  });
});
 
checkout.init();
```

### Addon shape

```
interface Addon {
  id: string;
  title: string;             // NOT `name`
  price: number;             // in cents
  description: string;
  subscription_details?: {
    starting_on: string;
    payment_frequency: string;
    free_trial_days: number;
    recurring_subtotal: number;
  };
}
 
interface AddonsChangedData {
  selectedAddons: string[];   // currently selected addon IDs
  addons: Addon[];            // all available addons (full objects)
}
```

Older docs and tutorials may reference `addon.name`, `addon.selected`, or `data.total` — those are wrong. Use the shape above. Determine selection state from `selectedAddons.includes(addon.id)`.

💡

Debugging the iframe URL

If you're inspecting the iframe's `src` attribute, note that addons are encoded as the URL param `addonIds` (CSV of IDs) — not `bump_product_ids`. The SDK renames it on the way to the iframe.

### Addon API methods

| Method | Use | Notes |
| --- | --- | --- |
| `addAddon(productId)` | Explicitly add a bump | **Preferred** for custom UI — deterministic |
| `removeAddon(productId)` | Explicitly remove a bump | **Preferred** for custom UI — deterministic |
| `toggleAddon(productId)` | Flip current state | Avoid for initial state — unreliable |
