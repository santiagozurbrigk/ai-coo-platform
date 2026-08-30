---
title: "Types & Interfaces"
source: "https://commasdocs.com/#sdk-types"
seccion: "SDK de checkout"
ancla: "#sdk-types"
capturado: "2026-08-30"
---

DEVELOPER RESOURCES

# Types & Interfaces

Complete TypeScript interfaces from `@fanbasis/checkout-core@0.5.0` and `@fanbasis/checkout-react@0.4.0`.

### CheckoutConfig

```
interface CheckoutConfig {
  // Required
  creatorId: string;
  productId: string;
  checkoutSessionSecret: string;
  environment: 'sandbox' | 'production';
 
  // Optional
  bumpProductIds?: string[];
  couponCode?: string;
  affiliateCode?: string;
  metadata?: Record<string, string>;
  collectPhone?: boolean;
  showAllAddons?: boolean;
  showSubmitButton?: boolean;          // default: true
  redirectSettings?: RedirectSettings;
  theme?: CustomizationParams;
  containerOptions?: { width?: string; height?: string };
  overrideBaseUrl?: string;
}
```

### CustomizationParams

```
interface CustomizationParams {
  // REQUIRED when theme is provided
  theme: 'light' | 'dark';
  show_product_info: boolean;
  product_layout: 'left' | 'above';
  show_coupon_row: boolean;
  accent_color: string;
 
  // Optional color overrides (hex)
  background_color?: string;
  label_color?: string;
  input_background_color?: string;
  product_text_color?: string;
  heading_color?: string;
  secondary_color?: string;
  border_color?: string;
  surface_color?: string;
 
  // Optional content & layout
  product_image?: string;
  coupon_row_disclaimer?: string;
  show_headings?: boolean;
  show_powered_by?: boolean;
  billing_form_placement?: 'above' | 'left';
 
  // Optional field control (0.4.0+)
  prefill?: PrefillConfig;
  fields?: FieldsConfig;
 
  /** @deprecated CSV of field names. Use `fields` for per-field visibility/disable instead. */
  billing_display_fields?: string;
}
```

### PrefillConfig & FieldsConfig

```
interface PrefillConfig {
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: PrefillAddress;
}
 
interface PrefillAddress {
  country?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
}
 
interface FieldsConfig {
  email?:      FieldControl;
  first_name?: FieldControl;
  last_name?:  FieldControl;
  phone?:      FieldControl;
  address?:    FieldControl;
}
 
interface FieldControl {
  hide?: boolean;
  disable?: boolean;
}
```

### RedirectSettings & CheckoutState

```
interface RedirectSettings {
  success_redirect_url?: string;
  failure_redirect_url?: string;
  always_redirect?: boolean;
}
 
interface CheckoutState {
  isOpen: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: PaymentError | null;
}
```

### Event data types

```
interface CheckoutSuccessData {
  transactionId: string;
  amount: number;
  currency: string;
  customer: any;        // buyer info — shape varies by processor
  metadata: any;        // whatever you passed in CheckoutConfig.metadata
}
 
interface FormReadyData {
  timestamp: number;
}
 
interface FormSubmittingData {
  paymentMethod: string;
  timestamp: number;
  timestamp_iso?: string;
}
 
interface FormSubmissionErrorData {
  type: 'FORM_SUBMISSION_ERROR';
  timestamp: number;
  data: {
    errorCode: string;        // gateway error code, e.g. 'card_declined'
    errorMessage: string;     // user-friendly message
    retryable: boolean;
  };
}
 
interface FormValidationData {
  isValid: boolean;
  fields: Record<string, { valid: boolean; error: string | null }>;
}
 
interface AddonsChangedData {
  selectedAddons: string[];
  addons: Addon[];
}
 
interface Addon {
  id: string;
  title: string;
  price: number;
  description: string;
  subscription_details?: {
    starting_on: string;
    payment_frequency: string;
    free_trial_days: number;
    recurring_subtotal: number;
  };
}
 
interface CouponAppliedData {
  code: string;
  discountAmount: number;
  newTotal: number;
}
 
interface CouponErrorData {
  code: string;
  error: string;
}
 
interface FieldValueData {
  field: string;
  value: string | PrefillAddress | null;
}
```

### PaymentError & PaymentErrorCode

```
class PaymentError extends Error {
  readonly code: PaymentErrorCode;
  readonly details?: any;
  // .message inherited from Error
}
 
enum PaymentErrorCode {
  INVALID_CONFIG                   = 'INVALID_CONFIG',
  CREATOR_ID_REQUIRED              = 'CREATOR_ID_REQUIRED',
  PRODUCT_ID_REQUIRED              = 'PRODUCT_ID_REQUIRED',
  CHECKOUT_SESSION_SECRET_REQUIRED = 'CHECKOUT_SESSION_SECRET_REQUIRED',
  FIELD_VALIDATION_ERROR           = 'FIELD_VALIDATION_ERROR',
  FIELD_NOT_SETTABLE               = 'FIELD_NOT_SETTABLE',
  IFRAME_NOT_READY                 = 'IFRAME_NOT_READY',
  UNKNOWN_ERROR                    = 'UNKNOWN_ERROR'
}
```

### PaymentCheckout class API

```
class PaymentCheckout extends EventEmitter {
  // Construction
  constructor(config: CheckoutConfig);
  static create(config: CheckoutConfig): PaymentCheckout;       // SYNCHRONOUS
  static fromElement(element: HTMLElement, config: CheckoutConfig): PaymentCheckout;
 
  // Lifecycle
  init(): Promise<void>;
  destroy(): void;
  cleanup(): void;
  attachToElement(element: HTMLElement): void;
 
  // State
  getState(): CheckoutState;
  isFormReady(): boolean;
 
  // Config — ⚠ both rewrite iframe.src and trigger a full reload,
  // which destroys any partially-filled buyer input. Prefer setting
  // the config correctly at create() time when possible.
  updateConfig(newConfig: Partial<CheckoutConfig>): void;
  updateTheme(newTheme: CustomizationParams): void;
 
  // Form
  submitForm(options?: { paymentMethod?: string; forceValidation?: boolean }): void;
 
  // Addons
  addAddon(addonId: string): void;
  removeAddon(addonId: string): void;
  toggleAddon(addonId: string): void;
 
  // Coupons
  applyCoupon(code: string): void;
  removeCoupon(): void;
 
  // Field setters/getters (Promise-returning)
  setEmail(value: string): Promise<void>;
  getEmail(): Promise<string | null>;
  setFirstName(value: string): Promise<void>;
  getFirstName(): Promise<string | null>;
  setLastName(value: string): Promise<void>;
  getLastName(): Promise<string | null>;
  setPhone(value: string): Promise<void>;
  getPhone(): Promise<string | null>;
  setAddress(value: PrefillAddress): Promise<void>;
  getAddress(): Promise<PrefillAddress | null>;
 
  // EventEmitter
  on<T extends CheckoutEventName>(event: T, listener: CheckoutEventListener<T>): this;
  once<T extends CheckoutEventName>(event: T, listener: CheckoutEventListener<T>): this;
  off<T extends CheckoutEventName>(event: T, listener: CheckoutEventListener<T>): this;
  removeAllListeners(): this;
}
```

### Event map

```js

interface CheckoutEvents {
  'checkout:opened':       () => void;
  'checkout:closed':       () => void;
  'checkout:loaded':       () => void;
  'checkout:error':        (error: PaymentError) => void;
  'checkout:success':      (data: CheckoutSuccessData) => void;
  'form:ready':            (data: FormReadyData) => void;
  'form:submitting':       (data: FormSubmittingData) => void;
  'form:submission_error': (data: FormSubmissionErrorData) => void;
  'form:validation':       (data: FormValidationData) => void;
  'addons:changed':        (data: AddonsChangedData) => void;
  'coupon:applied':        (data: CouponAppliedData) => void;
  'coupon:error':          (data: CouponErrorData) => void;
  'field:value':           (data: FieldValueData) => void;
}
 
type CheckoutEventName = keyof CheckoutEvents;
type CheckoutEventListener<T extends CheckoutEventName> = CheckoutEvents[T];
```

### React SDK exports

```
// Components
export { CheckoutProvider, useCheckoutContext } from './CheckoutProvider';
export { Checkout, CheckoutButton } from './Checkout';
export { SubmitButton } from './SubmitButton';
export { AutoCheckout } from './AutoCheckout';
export { CheckoutAddons } from './CheckoutAddons';
export { useCheckout } from './useCheckout';
 
// Re-exported types from core
export type {
  CheckoutConfig, CheckoutState,
  CheckoutEventName, CheckoutEventListener,
  CustomizationParams, Theme, ProductLayout,
  PaymentError, PaymentErrorCode, SubmitFormOptions,
  FormSubmittingData, FormSubmissionErrorData, FormReadyData,
  FormValidationData, FormValidationFieldStatus,
  Addon, AddonsChangedData
} from '@fanbasis/checkout-core';
```

### Browser compatibility

| Browser | Minimum version |
| --- | --- |
| Chrome | 80+ |
| Firefox | 78+ |
| Safari | 13+ |
| Edge | 80+ |
| Mobile Safari (iOS) | 13+ |
| Chrome for Android | 80+ |

**Requirements:** JavaScript enabled, third-party cookies allowed (for iframe communication), `postMessage` API support.

### Security

The checkout iframe uses these sandbox attributes:

```
sandbox="allow-scripts allow-same-origin allow-forms allow-popups
         allow-modals allow-downloads
         allow-top-navigation-by-user-activation"
allow="payment"
```

The separate `allow="payment"` permission policy is required by browsers for the Payment Request API to work inside the iframe (Apple Pay, Google Pay, etc.). All payment data (card numbers, CVV) stays within the iframe and is **never exposed to the parent page**. The parent page only receives event data via `postMessage`.
