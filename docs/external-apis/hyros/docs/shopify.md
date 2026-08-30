---
title: "Shopify"
source: "https://docs.hyros.com/docs/shopify"
seccion: "Integrations"
capturado: "2026-08-30"
---

# Shopify

This guide will walk you through integrating your Shopify store with HYROS for complete ecommerce tracking and attribution.

If you need any help, contact support or your onboarding manager. We are standing by!

1

## Use The 1 Click HYROS Integration

#### A. Find your Shopify store URL

In **Shopify**: **Settings** → **Domains** → copy your store URL ending in `myshopify.com` (e.g. `yourstore.myshopify.com`).

**Use the**`myshopify.com`**URL, not your custom domain.** The integration needs the original Shopify-assigned URL — using a custom domain (e.g. `yourstore.com`) will fail.

#### B. Connect Shopify

1. In Hyros: profile icon → Settings → Integrations → search Shopify [→ Connect Shopify](https://app.hyros.com/external-services/cart-integration/shopify)

2. Click Connect Shopify → paste your store URL → Create

3. On the next prompt, click Install to authorize the Hyros app in your Shopify account

---

## Optional Steps

Additional configuration options for your Shopify integration.

[BetterCart Integration](./bettercart-integration.md) — Set up tracking for BetterCart abandoned cart recovery

[Intrecart Integration](./intrecart-integration.md) — Configure Intrecart for SMS cart recovery tracking

[Pagefly Integration](./pagefly-integration.md) — Add tracking to Pagefly landing pages

[PayPal](./paypal.md) — Improve PayPal tracking accuracy with transaction ID matching

[Product Recommendation Quizzes](./product-recommendation-quizzes.md) — Track RevenueHunt quiz leads

[Recharge Integration](./recharge-integration.md) — Track subscription orders through Recharge

[Zipify Pages](./zipify-pages.md) — Add tracking to Zipify landing pages

[AIR Setup for Shopify](./air-setup-for-shopify.md) — Enable AI-powered optimization for your Shopify store

---

[Shopify Migration Step by Step](./shopify-migration-step-by-step.md) — Migrate from another tracking system to HYROS

[Sales Mapping using Shopify](./sales-mapping-using-shopify.md) — Map sales data with Shopify integration

[Adding Shopify Store Name to Product Tag](./adding-shopify-store-name-to-product-tag.md) — Tag products with your store name

[Filter Shopify Sales by specific channel](./filter-shopify-sales-by-specific-channel.md) — Filter sales by channel source

[Enable/Disable Lead processing](./enable-disable-lead-processing.md) — Configure lead processing settings

## FAQ

#### Can I track Amazon sales?

Currently, Amazon does not allow us to implement our tracking mechanism to identify which specific sources contribute to Amazon sales.

Nevertheless, in Hyros, we will tag all sales originating from Amazon with the source

@amazon

.

#### Can I import previous data (from before I started using Hyros)?

Yes, you can import previous data into Hyros from before you signed up. You can import data up to 365 days old. To upload the data you need to go inside the Shopify integration and click **Import old sales**. **Why import old sales?** Although you can import previous sales into Hyros, please note that you will **NOT** be able to see the source of these sales did not have any tracking setup added to your business at the time these sales occurred. While we cannot see the source of these type of events, one benefit of importing old sales into Hyros may be the use of LTV for a segment. This will help you see the average value of your leads over a period of time. For more details follow the [LTV for a Segment](https://docs.hyros.com/docs/ltv-segment) documentation.
