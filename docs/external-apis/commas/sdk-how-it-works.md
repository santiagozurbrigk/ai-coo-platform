---
title: "How it works"
source: "https://commasdocs.com/#sdk-how-it-works"
seccion: "SDK de checkout"
ancla: "#sdk-how-it-works"
capturado: "2026-08-30"
---

DEVELOPER RESOURCES

# How it works

The Commas Embedded Checkout SDK renders a secure payment form inside an iframe hosted at `embedded.fanbasis.io`. The parent page communicates with it via `postMessage`. Customers complete payment inside the iframe; the parent page handles redirect or success state via events.

### Integration flow

1. **Set up products** — Configure products in the Commas dashboard or via the REST API.

2. **Create a checkout session secret** — Server-side API call that authenticates your checkout instance.

3. **Initialize the SDK** — Load the SDK via CDN script or npm package, pass in your config.

4. **Listen for events** — Handle checkout:success, checkout:error, and other lifecycle events.

5. **Verify the transaction** — (Recommended) Confirm payment server-side using the transactionId from the success event.

### Two SDK options

| SDK | Best for | Install |
| --- | --- | --- |
| **Hosted JavaScript** (CDN) | Page builders (GHL, WordPress, Squarespace, Wix, Webflow), static sites, custom HTML | `<script>` tag — no build step |
| **React SDK** | React and Next.js applications | `npm install @fanbasis/checkout-react` |

Both SDKs share the same configuration shape and event system. The hosted JS SDK is by far the most common for sellers using page builders.
