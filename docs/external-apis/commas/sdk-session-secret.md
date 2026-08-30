---
title: "Session Secret"
source: "https://commasdocs.com/#sdk-session-secret"
seccion: "SDK de checkout"
ancla: "#sdk-session-secret"
capturado: "2026-08-30"
---

DEVELOPER RESOURCES

# Session Secret

The checkout session secret is a required credential that authenticates your checkout instance with Commas.

⚠ Never expose your API key in frontend code

Generate the secret server-side and pass only the secret to the browser.

### Key facts

- **Required** for every SDK initialization.
- **Tied to a creator**, not a product — one secret works across all products for that creator.
- **Reusable** — secrets don't expire after a single use.
- **Environment-specific** — use sandbox API key for sandbox, production API key for production.
- For static sites / page builders, generate once and hardcode. For dynamic apps, generate per page load from your server.

### API endpoint

```
POST https://www.fanbasis.com/public-api/checkout-sessions/embedded
 
Headers:
  x-api-key: <your-api-key>
  Content-Type: application/json
 
Body:
  {
    "creator_id": "<your-creator-slug>",   // required
    "product_id": "<product-id>",          // required
    "metadata":   { ... }                  // optional, stored on the session
  }
```

ℹ Body parameters

- `creator_id` **(required)** — your creator slug.
- `product_id` **(required)** — the product to embed checkout for. The returned secret is reusable across all your products under this creator.
- `metadata` _(optional)_ — arbitrary JSON object stored on the session and echoed back in webhook events for the resulting transaction.

### Examples

```bash
curl --location --request POST \
  'https://www.fanbasis.com/public-api/checkout-sessions/embedded' \
  --header 'x-api-key: YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "creator_id": "your-creator-slug",
    "product_id": "NLxj6"
  }'
```

```bash
curl --location --request POST \
  'https://www.fanbasis.com/public-api/checkout-sessions/embedded' \
  --header 'x-api-key: YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "creator_id": "your-creator-slug",
    "product_id": "NLxj6",
    "metadata": {
      "user_id": "usr_abc123",
      "source": "in-app",
      "campaign": "summer-launch"
    }
  }'
```

```js
const express = require('express');
const app = express();
 
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const response = await fetch(
      'https://www.fanbasis.com/public-api/checkout-sessions/embedded',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.FANBASIS_API_KEY
        },
        body: JSON.stringify({
          creator_id: 'your-creator-slug',
          product_id: 'NLxj6',
          metadata: {                  // optional
            user_id: req.user.id,
            source: 'in-app'
          }
        })
      }
    );
    const json = await response.json();
    res.json({ checkoutSessionSecret: json.data.checkout_session_secret });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create session secret' });
  }
});
```

```json
{
  "status": "success",
  "message": "Embedded checkout session created successfully",
  "data": {
    "id": 3204,
    "checkout_session_secret": "84efcbc9-c8c9-49cf-8c7b-8b6b18939984",
    "metadata": { "user_id": "usr_abc123", "source": "in-app" },
    "allowed_payment_methods": null,
    "created_at": "2026-04-30T22:34:36.000000Z"
  }
}
```

The `checkout_session_secret` is what you pass as `checkoutSessionSecret` in the SDK config. For `creatorId`, use your creator slug — you can find it in your Commas dashboard (it's the handle in your checkout links). `metadata` is echoed back from the request and persisted on resulting transactions.
