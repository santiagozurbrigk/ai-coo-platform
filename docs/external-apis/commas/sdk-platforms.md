---
title: "Platform Guides"
source: "https://commasdocs.com/#sdk-platforms"
seccion: "SDK de checkout"
ancla: "#sdk-platforms"
capturado: "2026-08-30"
---

DEVELOPER RESOURCES

# Platform Guides

### GoHighLevel (GHL)

Use the **Custom HTML/Javascript** element in the GHL page builder.

- **Two-column layout squeeze** — GHL's two-column rows constrain the container to ~573px. **Fix:** Use a full-width row, or set `max-width: 1100px; margin: 0 auto;` on the wrapper.
- **Iframe border-radius** — GHL defaults override your styles. Add `!important`.
- **Test in the GHL preview tab**, not just the editor.

### WordPress

Use a **Custom HTML** block, shortcode, or Elementor HTML widget.

- Some themes/plugins interfere with the SDK script. Test in incognito.
- If using Elementor, place the code in an **HTML widget**, not a text widget.
- Aggressive caching may keep stale session secrets — beware if generating dynamically.

### Squarespace

Use the **Code Block** element (Business plan and above).

- Squarespace strips `<script>` tags in some block types. Use a Code Block specifically.
- Code injection (Settings → Advanced) works for site-wide scripts.

### Wix

Use the **Custom HTML** element (Wix Editor) or **Embed Code** (Wix Studio).

- Wix sandboxes custom HTML in their own iframe, creating nested iframes — checkout still works.
- Adjust container height generously — Wix's container may not auto-expand.

### Webflow

Use the **Embed** component in Webflow Designer.

- Place the embed in a full-width section for best results.
- Always test on the published URL — designer preview can differ.

### Shopify

Use a **Custom Liquid** section or edit theme code directly.

- Add the CDN script to `theme.liquid` or the specific template.
- Shopify's CSP may block inline scripts — use the `<script src="...">` approach.
