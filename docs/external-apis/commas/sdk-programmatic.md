---
title: "Programmatic Submission"
source: "https://commasdocs.com/#sdk-programmatic"
seccion: "SDK de checkout"
ancla: "#sdk-programmatic"
capturado: "2026-08-30"
---

DEVELOPER RESOURCES

# Programmatic Submission

Hide the default submit button and trigger form submission from your own button or custom validation logic.

```js
import {
  CheckoutProvider, AutoCheckout, SubmitButton
} from '@fanbasis/checkout-react';
 
const config = {
  creatorId: 'REPLACE_CREATOR_SLUG',
  productId: 'REPLACE_PRODUCT_ID',
  checkoutSessionSecret: 'REPLACE_SESSION_SECRET',
  environment: 'production',
  showSubmitButton: false,
  redirectSettings: {
    success_redirect_url: 'https://yoursite.com/thank-you',
    always_redirect: true
  }
};
 
function App() {
  return (
    <CheckoutProvider config={config}>
      <AutoCheckout autoInit />
      <SubmitButton
        onPaymentSuccess={(data) => { window.location.href = `https://yoursite.com/thank-you?tx=${data.transactionId}`; }}
        onError={(err) => { console.error('[checkout]', err.code, err.message); }}
        onSubmissionError={(d) => { alert(d.data.errorMessage); /* gateway error, buyer-friendly */ }}
      >
        {({ submit, isSubmitting }) => (
          <button onClick={submit} disabled={isSubmitting}>
            {isSubmitting ? 'Processing…' : 'Complete Purchase'}
          </button>
        )}
      </SubmitButton>
    </CheckoutProvider>
  );
}
```

```
var config = {
  creatorId: 'REPLACE_CREATOR_SLUG',
  productId: 'REPLACE_PRODUCT_ID',
  checkoutSessionSecret: 'REPLACE_SESSION_SECRET',
  environment: 'production',
  showSubmitButton: false,
  redirectSettings: {
    success_redirect_url: 'https://yoursite.com/thank-you',
    always_redirect: true
  }
};
 
var checkout = PaymentCheckout.create(config);
checkout.attachToElement(document.getElementById('checkout-container'));
 
// Enable the custom button when the form is interactive
checkout.on('form:ready', function() {
  document.getElementById('custom-pay-btn').disabled = false;
});
 
document.getElementById('custom-pay-btn').addEventListener('click', function() {
  if (checkout.isFormReady()) {
    checkout.submitForm();
  }
});
 
// The three base handlers — required to avoid "stuck on processing"
// and invisible errors. Register BEFORE init().
checkout.on('checkout:success', function(data) {
  window.location.href = 'https://yoursite.com/thank-you?tx=' + data.transactionId;
});
checkout.on('checkout:error', function(err) {
  // Integration error (e.g. IFRAME_NOT_READY) — log it, don't show to buyer
  console.error('[checkout]', err.code, err.message);
});
checkout.on('form:submission_error', function(d) {
  // Gateway error (card_declined, insufficient_funds, etc.) — show to buyer
  alert(d.data.errorMessage);
});
 
checkout.init();
```
