---
title: "Prefill & Field Control"
source: "https://commasdocs.com/#sdk-prefill"
seccion: "SDK de checkout"
ancla: "#sdk-prefill"
capturado: "2026-08-30"
---

DEVELOPER RESOURCES

# Prefill & Field Control

Pre-populate form fields and control their visibility/disabled state. Replaces the older "no native prefill" workaround pattern with a first-class API.

### Two ways to prefill

**Declarative** — set initial values via the `prefill` object inside `theme`. Values render the moment the form is interactive — no need to wait for `form:ready`.

```js
const checkout = PaymentCheckout.create({
  creatorId: 'creator-handle',
  productId: 'NLxj6',
  checkoutSessionSecret: '<uuid>',
  environment: 'production',
  theme: {
    theme: 'light',
    show_product_info: true,
    product_layout: 'left',
    show_coupon_row: true,
    accent_color: '#007BFF',
    prefill: {
      email: 'jane@example.com',
      first_name: 'Jane',
      last_name: 'Smith',
      phone: '+15551234567',
      address: {
        country: 'US',
        line1: '123 Main St',
        line2: 'Apt 4B',
        city: 'Austin',
        state: 'TX',
        postal_code: '78701'
      }
    }
  }
});
```

**Imperative** — set values after init via methods on the checkout instance. Useful when values become available after the iframe is mounted (e.g. logged-in user data fetched async).

```js
checkout.on('form:ready', async () => {
  await checkout.setEmail('jane@example.com');
  await checkout.setFirstName('Jane');
  await checkout.setLastName('Smith');
  await checkout.setPhone('+15551234567');
  await checkout.setAddress({
    country: 'US',
    line1: '123 Main St',
    city: 'Austin',
    state: 'TX',
    postal_code: '78701'
  });
});
 
checkout.init();
```

All setters return Promises. They reject with `IFRAME_NOT_READY` if called before `form:ready`, or `FIELD_VALIDATION_ERROR` if the value fails validation.

⚠

`setAddress()`

requires the address field to be hidden

`setAddress()` only succeeds when `theme.fields.address.hide` is `true` — otherwise it rejects with `FIELD_NOT_SETTABLE`. The intent: inject the address from the parent page (e.g., from a logged-in user profile) without showing the address inputs to the buyer. If you want the buyer to see and edit the address, use the declarative `theme.prefill.address` instead.

### Reading current values

Symmetric getters return the current value (or `null` if unset). Each `get*()` call has a **5-second timeout** — if the iframe doesn't respond, the promise rejects with `UNKNOWN_ERROR`.

```js
const email     = await checkout.getEmail();
const firstName = await checkout.getFirstName();
const lastName  = await checkout.getLastName();
const phone     = await checkout.getPhone();
const address   = await checkout.getAddress();
```

### PrefillConfig type

```
interface PrefillConfig {
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;          // E.164 format: '+15551234567'
  address?: PrefillAddress;
}
 
interface PrefillAddress {
  country?: string;        // ISO 3166-1 alpha-2 ('US', 'GB')
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;          // 2-letter state/province code where applicable
  postal_code?: string;
}
```

### Field visibility — the `fields` config

Hide or disable individual fields without removing them from validation logic. Replaces the deprecated `billing_display_fields` array.

```
theme: {
  // ... required theme fields ...
  fields: {
    email:      { disable: true },               // shown but locked (already known)
    first_name: { hide: true },                  // hidden entirely
    last_name:  { hide: true },
    phone:      { hide: false, disable: false }, // explicit defaults
    address:    { hide: true }                   // skip address collection
  }
}
```

```
interface FieldsConfig {
  email?:      FieldControl;
  first_name?: FieldControl;
  last_name?:  FieldControl;
  phone?:      FieldControl;
  address?:    FieldControl;
}
 
interface FieldControl {
  hide?: boolean;       // remove from form entirely
  disable?: boolean;    // show but make read-only
}
```

### When to hide vs disable

| Goal | Use |
| --- | --- |
| User shouldn't change the value (e.g., logged-in email) | `disable: true` + prefill |
| You don't need this data at all (e.g., digital product) | `hide: true` |
| Collect normally but pre-fill from a prior step | Just prefill, no field control needed |

### Common patterns

**Logged-in user — email locked, name editable:**

```
theme: {
  theme: 'light',
  show_product_info: true,
  product_layout: 'left',
  show_coupon_row: true,
  accent_color: '#007BFF',
  prefill: { email: currentUser.email },
  fields: { email: { disable: true } }
}
```

**Digital product — skip address entirely:**

```
theme: {
  theme: 'light',
  show_product_info: true,
  product_layout: 'left',
  show_coupon_row: true,
  accent_color: '#007BFF',
  fields: { address: { hide: true } }
}
```

### Phone number special case

Phone visibility is gated by **two independent toggles**:

- `collectPhone: true` at the top-level config — enables the phone field with the country-code selector. Required for phone to appear at all.
- `theme.fields.phone.hide` — if set to `true`, hides the phone field even when `collectPhone: true`.

The least surprising combination: set `collectPhone: true` and leave `fields.phone` unset. Setting `phone` in `prefill` or via `setPhone()` requires the field to be visible — i.e. `collectPhone: true` AND `fields.phone.hide` not set to `true`.

```js
const checkout = PaymentCheckout.create({
  // ... required config ...
  collectPhone: true,
  theme: {
    // ... required theme fields ...
    prefill: { phone: '+15551234567' }
  }
});
```

### Listening to field changes

The `field:value` event fires whenever a field's value changes — whether from a setter call, prefill, or user typing.

```js
checkout.on('field:value', function (data) {
  // data: { field: string, value: string | PrefillAddress | null }
  console.log(data.field + ' changed to', data.value);
});
```

### Setter error handling

| Error code | Cause | Fix |
| --- | --- | --- |
| `IFRAME_NOT_READY` | Called before `form:ready` event | Wait for `form:ready` or check `isFormReady()` |
| `FIELD_NOT_SETTABLE` | Field is hidden via `fields.{name}.hide: true` | Don't try to set hidden fields |
| `FIELD_VALIDATION_ERROR` | Value failed validation (bad email, invalid phone) | Validate values before passing to setter |
