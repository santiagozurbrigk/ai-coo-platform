---
title: "Thinkific Pages"
source: "https://docs.hyros.com/docs/thinkific-pages"
seccion: "General"
capturado: "2026-08-30"
---

# Thinkific Pages

This guide will show you how to track Thinkific pages and checkouts.

The setup below allows HYROS to track the visitor's journey and correctly identify leads when they sign up or make a purchase. However, it does not track sales revenue. To track purchases, revenue, refunds, subscriptions, and renewals, you'll also need to integrate your payment processor (such as Stripe or PayPal) with HYROS. Check the bottom of the page for sales tracking.

#### A. Copy the Universal Script

Copy the script below, or **In Hyros**: **profile icon** → **Settings** → **Tracking** → copy the Universal Script.

#### B. Adding the Script & the Code Snippet

1. In Thinkific, navigate to: **Settings**(left menu) → **Code & Analytics**(top bar) → **Site Footer Code** & paste the **script**

2. Navigate to **Order Tracking Code** & paste your **HYROS Universal Script**, then add the following **code snippet** below it.

code

```
<div id="hyros-email">{{ billing_email }}</div>
```

#### C. Track the SIgnup

1. Navigate to **Signup Tracking Code** paste your **HYROS Universal Script**, then add the **code snippet** below

code

```
<div id="hyros-email">{{ email }}</div>
```

2. Save All Changes

---

## Sales Tracking

[All Integrations](./all-integrations.md) — Check the Payment processors section to finish the setup.

---

## Verify & Troubleshoot the Universal script

[Troubleshoot the Universal script](./troubleshoot-the-universal-script.md) — Most Common Scenarios of Troubleshooting the Universal Tracking Script
