---
title: "Theme & Styling"
source: "https://commasdocs.com/#sdk-theme"
seccion: "SDK de checkout"
ancla: "#sdk-theme"
capturado: "2026-08-30"
---

DEVELOPER RESOURCES

# Theme & Styling

⚠ No theme presets beyond light/dark

The `theme` field accepts only `'light'` or `'dark'`. Values like `'green'`, `'mint'`, `'emerald'`, or any custom name fall back silently. For a branded look, use `'light'` as the base and override individual color slots — see the green theme example below.

### Theme schema (required + optional)

```
theme: {
  // ─── REQUIRED when theme is provided ───
  theme: 'light',                 // 'light' | 'dark' (no other presets)
  show_product_info: true,
  product_layout: 'left',         // 'left' | 'above'  (to hide product info entirely, set show_product_info: false)
  show_coupon_row: true,
  accent_color: '#007BFF',        // primary button/accent color (hex)
 
  // ─── OPTIONAL color overrides (all hex) ───
  background_color: '#FFFFFF',
  surface_color: '#FAFAFA',
  border_color: '#E0E0E0',
  input_background_color: '#F5F5F5',
  label_color: '#333333',
  heading_color: '#111111',
  product_text_color: '#333333',
  secondary_color: '#666666',
 
  // ─── OPTIONAL content & layout ───
  product_image: 'https://...',         // override product image URL
  coupon_row_disclaimer: 'Discount applied at checkout',
  show_headings: true,
  show_powered_by: true,                // toggle "Powered by Commas" footer
  billing_form_placement: 'above',      // 'above' | 'left'  ('above' = billing form above payment, 'left' = side-by-side)
 
  // ─── OPTIONAL field control (see Prefill & Field Control section) ───
  prefill: { /* ... */ },
  fields:  { /* ... */ },
 
  // ─── DEPRECATED — use `fields` instead ───
  billing_display_fields: 'first_name,last_name,email'   // CSV string, not an array
}
```

### Color properties

| Property | What it colors | Default (light) |
| --- | --- | --- |
| `accent_color` | Buttons, links, focus states | — (required) |
| `background_color` | Main form background | `#FFFFFF` |
| `label_color` | Input labels | `#333333` |
| `input_background_color` | Inside input fields | `#F5F5F5` |
| `heading_color` | Section headings | `#111111` |
| `secondary_color` | Helper text, subtotals | `#666666` |
| `product_text_color` | Product name, price, description | `#333333` |
| `border_color` | Input borders, dividers | `#E0E0E0` |
| `surface_color` | Card / section backgrounds | `#FAFAFA` |

### Product layout options

| Value | Description |
| --- | --- |
| `'left'` | Product info on the left, form on the right (default for desktop widths) |
| `'above'` | Product info stacked above the form |

💡

Hiding product info entirely

There's no `'none'` value — set `show_product_info: false` on the theme config to hide the product hero. Useful when you want to render product info yourself on the parent page and use the iframe for billing/payment only.

### Container & iframe styling

Set iframe dimensions via config or via CSS (preferred for page builders):

```
#checkout-container {
  width: 98%;
  height: 1100px;
}
#checkout-container iframe {
  width: 98% !important;
  height: 1100px !important;
  border-radius: 20px;
}
```

- CSS on the parent page does **not** penetrate the iframe boundary.
- `border-radius` works when applied to the iframe element itself.
- `!important` is often needed to override SDK-applied inline styles.
- Custom fonts from the parent page don't affect the iframe — it loads its own.

### Branded theme example — emerald / mint

Achieve a fully branded look by setting `theme: 'light'` and overriding the color slots. The example below mirrors the green look on `demo.embedded.fanbasis.io`:

```
theme: {
  theme: 'light',                  // base
  show_product_info: true,
  product_layout: 'left',
  show_coupon_row: true,
  accent_color: '#10b981',         // emerald-500 (Pay button)
  background_color: '#f0fdf4',     // green-50
  surface_color: '#ecfdf5',        // emerald-50
  border_color: '#a7f3d0',         // emerald-200
  input_background_color: '#ecfdf5',
  heading_color: '#065f46',        // emerald-800
  label_color: '#065f46',
  secondary_color: '#047857',      // emerald-700
  product_text_color: '#064e3b'    // emerald-900
}
```

### Dark theme example

```
theme: {
  theme: 'dark',
  show_product_info: true,
  product_layout: 'above',
  show_coupon_row: false,
  accent_color: '#ff6b6b',
  background_color: '#1a1a1a',
  label_color: '#ffffff',
  input_background_color: '#2d2d2d',
  product_text_color: '#e0e0e0',
  heading_color: '#ffffff',
  secondary_color: '#9ca3af',
  border_color: '#374151',
  surface_color: '#2d2d2d'
}
```
