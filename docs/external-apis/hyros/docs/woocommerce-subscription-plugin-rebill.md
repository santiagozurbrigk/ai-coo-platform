---
title: "WooCommerce Subscription Plugin Rebill"
source: "https://docs.hyros.com/docs/woocommerce-subscription-plugin-rebill"
seccion: "General"
capturado: "2026-08-30"
---

# WooCommerce Subscription Plugin Rebill

Configure subscription tracking for trial periods.

By default, "Subscription plugin rebilling" must be enabled. However, if your business has subscription plans with trial periods, then we will want to disable it.

An example of when this function should be disabled is if we have the following situation:

1. Customer starts subscription for X trial days.

2. The customer pays after X days their first payment.

3. The customer pays subscriptions.

With the journey above, having the default configuration, step 2 will be marked sales, which is not correct in this case. Turning off "Subscription plugin rebilling" the clients will be tracked correctly.
