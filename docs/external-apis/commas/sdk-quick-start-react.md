---
title: "Quick Start — React"
source: "https://commasdocs.com/#sdk-quick-start-react"
seccion: "SDK de checkout"
ancla: "#sdk-quick-start-react"
capturado: "2026-08-30"
---

DEVELOPER RESOURCES

# Quick Start — React

### Installation

```bash
npm install @fanbasis/checkout-react
```

```bash
yarn add @fanbasis/checkout-react
```

```bash
pnpm add @fanbasis/checkout-react
```

The React SDK internally depends on `@fanbasis/checkout-core`.

### Basic integration

Minimum viable React integration — includes all the base requirements (redirectSettings with `always_redirect`, success/error handlers, and a gateway-error listener for card declines):

```js
import { useEffect, useState } from 'react';
import {
  CheckoutProvider, AutoCheckout, useCheckoutContext
} from '@fanbasis/checkout-react';
 
function App() {
  const [error, setError] = useState(null);
 
  const config = {
    creatorId: 'REPLACE_CREATOR_SLUG',
    productId: 'REPLACE_PRODUCT_ID',
    checkoutSessionSecret: 'REPLACE_SESSION_SECRET',
    environment: 'production',
    redirectSettings: {
      success_redirect_url: 'https://yoursite.com/thank-you',
      always_redirect: true
    },
    theme: {
      theme: 'light',
      accent_color: '#007BFF',
      show_product_info: true,
      product_layout: 'left',
      show_coupon_row: false
    }
  };
 
  return (
    <>
      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: 12, borderRadius: 8, marginBottom: 12 }}>
          ⚠ {error}
        </div>
      )}
      <CheckoutProvider config={config}>
        <GatewayErrors onError={setError} />
        <AutoCheckout
          autoInit
          onSuccess={(data) => {
            window.location.href = `https://yoursite.com/thank-you?tx=${data.transactionId}`;
          }}
          onError={(err) => {
            // Integration error (config, iframe state) — log it
            console.error('[checkout]', err.code, err.message);
            setError(err.message || 'Could not load checkout.');
          }}
        />
      </CheckoutProvider>
    </>
  );
}
 
// Gateway errors (card_declined, insufficient_funds, etc.) come through
// form:submission_error — not on AutoCheckout props. Attach a listener
// inside the provider via useCheckoutContext.
function GatewayErrors({ onError }) {
  const { getCheckout } = useCheckoutContext();
  useEffect(() => {
    const c = getCheckout();
    if (!c) return;
    const handler = (d) => onError(d.data.errorMessage);
    c.on('form:submission_error', handler);
    return () => c.off('form:submission_error', handler);
  }, [getCheckout, onError]);
  return null;
}
```

⚠ CheckoutProvider takes only

`config`

and

`children`

Lifecycle callbacks like `onSuccess`, `onError`, `onLoad`, etc. live on `AutoCheckout` and `SubmitButton`, not on the provider. The prop is `autoInit` (not `autoOpen`).

### useCheckout hook

Access checkout state and methods from any component inside `CheckoutProvider`:

```js
import { useCheckout } from '@fanbasis/checkout-react';
 
function CheckoutStatus() {
  const {
    // State (unwrapped from CheckoutState)
    isOpen,            // boolean — checkout iframe is open/visible
    isLoading,         // boolean — initial load in progress
    isInitialized,     // boolean — init() completed
    error,             // PaymentError | null
 
    // Lifecycle
    init,              // (element?) => Promise<void>
    destroy,           // () => void
    attachToElement,   // (element) => void
 
    // Config
    updateConfig,      // (Partial<CheckoutConfig>) => void
 
    // Events
    on,                // (event, listener) => void
    off,               // (event, listener) => void
 
    // Form
    submitForm,        // (options?) => void
    isFormReady,       // () => boolean
 
    // Direct access to underlying instance
    getCheckout,       // () => PaymentCheckout | null
 
    // Field setters/getters
    setEmail, getEmail,
    setFirstName, getFirstName,
    setLastName,  getLastName,
    setPhone,     getPhone,
    setAddress,   getAddress,
  } = useCheckout();
}
```

For lower-level access (subscribing to events directly, etc.), `useCheckoutContext()` exposes the same surface plus the raw `state` object.

### Components

| Component | Purpose |
| --- | --- |
| `CheckoutProvider` | Root provider. Takes only `config: CheckoutConfig` + `children`. Wrap your other checkout components in this. Event callbacks live on `AutoCheckout` / `SubmitButton`, not on the provider. |
| `AutoCheckout` | Self-contained checkout. Props: `autoInit`, `className`, `style`, `showLoadingState`, `loadingComponent`, `errorComponent`, `onInit`, `onLoad`, `onSuccess`, `onError`, `onDestroy`. |
| `Checkout` | Render-prop component. Children receive the full `useCheckout()` shape. |
| `CheckoutButton` | Tiny prebuilt button that calls `submitForm()` on click. |
| `SubmitButton` | Render-prop submit button with lifecycle props: `onFormReady`, `onFormSubmitting`, `onFormSubmissionError`, `onPaymentSuccess`, `onPaymentError`. Children receive `{ submit, isSubmitting, error }`. |
| `CheckoutAddons` | Render-prop addon UI. Children receive `{ addons, selectedAddons, addAddon, removeAddon, toggleAddon }`. |

### Hooks

| Hook | Returns |
| --- | --- |
| `useCheckout()` | Flat object combining `CheckoutState` fields and methods (see code block above) |
| `useCheckoutContext()` | Lower-level — returns `{ state, getCheckout, init, destroy, on, off, ... }` with `state` as a nested object |

### Next.js (App Router)

Same base requirements apply — fetch the session secret server-side (so your API key never reaches the client), then mount with the full config:

```js
'use client'; // Required for Next.js App Router
 
import { useEffect, useState } from 'react';
import { CheckoutProvider, AutoCheckout, useCheckoutContext } from '@fanbasis/checkout-react';
import { useRouter } from 'next/navigation';
 
export default function CheckoutPage() {
  const router = useRouter();
  const [secret, setSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
 
  // Fetch the embedded session secret from a Next.js route handler
  // that calls /public-api/checkout-sessions/embedded with your API key
  useEffect(() => {
    fetch('/api/embedded-session', { method: 'POST' })
      .then(r => r.ok ? r.json() : Promise.reject(new Error('Session fetch failed')))
      .then(d => setSecret(d.checkoutSessionSecret))
      .catch(e => setError(e.message));
  }, []);
 
  if (error)  return <p style={{ color: '#991b1b' }}>⚠ {error}</p>;
  if (!secret) return <p>Loading…</p>;
 
  return (
    <CheckoutProvider
      config={{
        creatorId: 'REPLACE_CREATOR_SLUG',
        productId: 'REPLACE_PRODUCT_ID',
        checkoutSessionSecret: secret,
        environment: 'production',
        redirectSettings: {
          success_redirect_url: `${window.location.origin}/thank-you`,
          always_redirect: true
        },
        theme: { theme: 'light', accent_color: '#007BFF', show_product_info: true, product_layout: 'left', show_coupon_row: true }
      }}
    >
      <GatewayErrors onError={setError} />
      <AutoCheckout
        autoInit
        onSuccess={(data) => router.push(`/thank-you?tx=${data.transactionId}`)}
        onError={(err) => setError(err.message || 'Could not load checkout.')}
      />
    </CheckoutProvider>
  );
}
 
function GatewayErrors({ onError }: { onError: (s: string) => void }) {
  const { getCheckout } = useCheckoutContext();
  useEffect(() => {
    const c = getCheckout();
    if (!c) return;
    const h = (d: any) => onError(d.data.errorMessage);
    c.on('form:submission_error', h);
    return () => c.off('form:submission_error', h);
  }, [getCheckout, onError]);
  return null;
}
```

### Checkout (render props)

Lower-level component with a render-props API for full control over the checkout UI and lifecycle.

```js
import { Checkout } from '@fanbasis/checkout-react';
 
function CustomCheckout() {
  return (
    <Checkout>
      {({ isOpen, isLoading, open, close }) => (
        <div>
          <button onClick={open} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Open Checkout'}
          </button>
          {isOpen && (
            <div>
              <p>Checkout is open</p>
              <button onClick={close}>Close</button>
            </div>
          )}
        </div>
      )}
    </Checkout>
  );
}
```

### SubmitButton

A customizable submit button that connects to the checkout form automatically.

```js
import { SubmitButton } from '@fanbasis/checkout-react';
 
function CustomSubmitButton() {
  return (
    <SubmitButton
      className="custom-submit-btn"
      disabled={false}
      onClick={() => console.log('Submit clicked')}
    >
      Complete Purchase
    </SubmitButton>
  );
}
```

### Event handling with hooks

Use `useEffect` with the raw `checkout` instance for fine-grained event control. Always return a cleanup function to unsubscribe.

```js
import { useCheckout } from '@fanbasis/checkout-react';
import { useEffect } from 'react';
 
function CheckoutEvents() {
  // useCheckout() exposes on/off directly — there is no `checkout` property.
  const { on, off } = useCheckout();
 
  useEffect(() => {
    const handleSuccess = (data) => {
      console.log('Payment successful:', data);
    };
 
    const handleError = (error) => {
      console.error('Payment failed:', error);
    };
 
    on('checkout:success', handleSuccess);
    on('checkout:error', handleError);
 
    // Cleanup — always unsubscribe
    return () => {
      off('checkout:success', handleSuccess);
      off('checkout:error', handleError);
    };
  }, [on, off]);
 
  return <div>Checkout events are being monitored</div>;
}
```

### State management

The `useCheckout` hook exposes the reactive checkout state as **unwrapped fields** (`isOpen`, `isLoading`, `isInitialized`, `error`) — destructure them directly. (If you need the raw nested `state` object, use `useCheckoutContext()` instead.)

```js
import { useCheckout } from '@fanbasis/checkout-react';
 
function CheckoutState() {
  const { isOpen, isLoading, isInitialized, error } = useCheckout();
 
  return (
    <div>
      <p>Open: {isOpen ? 'Yes' : 'No'}</p>
      <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
      <p>Initialized: {isInitialized ? 'Yes' : 'No'}</p>
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
```

### Multiple checkout instances

Each `CheckoutProvider` manages its own isolated checkout instance. Nest multiple providers for multi-product pages.

```js
import { CheckoutProvider, AutoCheckout } from '@fanbasis/checkout-react';
 
function MultiProductPage() {
  const product1 = {
    creatorId: 'creator_123',
    productId: 'product_1',
    checkoutSessionSecret: 'secret_1',
    environment: 'production'
  };
 
  const product2 = {
    creatorId: 'creator_123',
    productId: 'product_2',
    checkoutSessionSecret: 'secret_2',
    environment: 'production'
  };
 
  return (
    <div>
      <CheckoutProvider config={product1}>
        <AutoCheckout />
      </CheckoutProvider>
 
      <CheckoutProvider config={product2}>
        <AutoCheckout />
      </CheckoutProvider>
    </div>
  );
}
```

### Testing

```js
import { render } from '@testing-library/react';
import { CheckoutProvider, AutoCheckout } from '@fanbasis/checkout-react';
 
const mockConfig = {
  creatorId: 'test_creator',
  productId: 'test_product',
  checkoutSessionSecret: 'test_secret',
  environment: 'sandbox'
};
 
test('renders checkout component', () => {
  render(
    <CheckoutProvider config={mockConfig}>
      <AutoCheckout />
    </CheckoutProvider>
  );
});
```

### Package details

| Detail | Value |
| --- | --- |
| Peer dependencies | React, React DOM |
| Internal dependency | `@fanbasis/checkout-core` |
| TypeScript | Full type definitions included |
