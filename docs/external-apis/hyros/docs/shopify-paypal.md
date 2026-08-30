---
title: "PayPal Integration for Shopify"
source: "https://docs.hyros.com/docs/shopify-paypal"
seccion: "Integrations > Shopify"
capturado: "2026-08-30"
---

# PayPal Integration for Shopify

Improve PayPal tracking accuracy by enabling transaction ID matching on your Shopify store.

If for some reason you cannot complete any of the below steps, you will still be tracking PayPal sales by default.

However, please keep in mind that when a lead purchases with a unique PayPal email that has not been tracked by HYROS on a previous page, we will not be able to track the sale back to the correct ad or origin email.

This means we cannot guarantee 100% tracking accuracy for PayPal sales in these cases, because we rely on the PayPal email matching exactly with a previously tracked email. The steps below are intended to resolve this issue.

###### **A. Open Website Payments settings in PayPal**

In **PayPal**: **profile icon** (top-right) → **Account Settings** → left menu → **Products and Services** → **Website Payments** → **Website Preferences** → **Update**.

###### **B. Enable Auto Return and Payment Data Transfer**

Both settings must be turned on for tracking to work:

1. Enable Auto Return for Website Payments → paste the URL of your thank you page in the return URL field

2. Scroll down and enable Payment Data Transfer

###### **C. Use a compatible PayPal button**

For 100% tracking accuracy, use one of these buttons on your checkout page.

In **PayPal**: **Website Payments** → **PayPal Buttons** → **Update**. Use one of:

- Buy Now — for one-time purchases
- Add to Cart — for shopping cart flows
- Subscribe — for recurring subscriptions
