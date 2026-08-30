---
title: "PayPal"
source: "https://docs.hyros.com/docs/paypal"
seccion: "Payment Processors"
capturado: "2026-08-30"
---

# PayPal

Connect PayPal for payment tracking. Learn how to properly configure PayPal to track sales accurately using transaction IDs.

1

## Configure Paypal Settings

#### A. Open Website Payments settings in PayPal

In **PayPal**: **profile icon** (top-right) → **Account Settings** → left menu → **Products and Services** → **Website Payments** → **Website Preferences** → **Update**.

#### B. Enable Auto Return and Payment Data Transfer

Both settings must be turned on for tracking to work:

1. Enable Auto Return for Website Payments → paste the URL of your thank you page in the return URL field

2. Scroll down and enable Payment Data Transfer

#### C. Use a compatible PayPal button

For 100% tracking accuracy, use one of these buttons on your checkout page.

In **PayPal**: **Website Payments** → **PayPal Buttons** → **Update**. Use one of:

- Buy Now — for one-time purchases
- Add to Cart — for shopping cart flows
- Subscribe — for recurring subscriptions

Why is it important to use the recommended payment buttons?

If for some reason you cannot complete any of the above steps, you can still continue to the next steps, but please keep in mind that when a lead purchases with a unique PayPal email that has not been tracked by Hyros on a previous page, we will not be able to track the sale back to the correct origin email. This means we cannot guarantee 100% tracking accuracy for PayPal sales in these cases, because we rely on the PayPal email matching exactly with a previously tracked email. The steps above are intended to resolve this issue.

Workaround if you're using Clickfunnels Pro Tools

The only other current workaround is to pair PayPal with ClickFunnels and CF Pro Tools using [this guide.](https://docs.hyros.com/docs/clickfunnels-pro-tools-most-accurate-cf-tracking-set-up) This will only work if you are using ClickFunnels for your funnel pages.

2

## Choose the PayPal Integration

Go to [**Settings → Integrations**](https://app.hyros.com/settings/integrations) and then find PayPal and select **"configure"**:

Please choose one of the two integrations available for PayPal.

---

#### Option A - Paypal webhook integration

The Paypal Webhooks integration is our primary and most up-to-date version. For the majority of businesses this is the one you will select. Just follow the video when setting up the webhook integration.

---

#### Option B - Paypal IPN Integration

If you decide to use the Paypal Instant Payment Notification integration (IPN), please take in mind that if you are already making use of the IPN in your Paypal account you can NOT use a second one.

**If you are using the main webhook integration you will not need to follow the next steps in the guide.**

To integrate with the Paypal IPN integration, just follow these steps:

#### A. Create the Integration (IPN Integration Only)

- Inside Hyros go to the Paypal IPN integration [HERE](https://app.hyros.com/#/mh/external-services/cart-integration/paypal_ipn). Follow the steps to create the integration.
- Once the integration is created, click "get webhook" and copy the webhook.

#### B. Insert the Webhook Inside your PayPal Account (IPN Integration Only)

- Log into your Paypal account.
- Click the settings icon at the top of your PayPal account page and then click Account Settings.
- On the notifications page, click the update link for the Instant payment notifications item.
- Click Choose IPN Settings to specify your listener's URL and activate the listener. The following page opens, follow these instructions:

---

This concludes the setup. You should now see sales come in from PayPal. If you do not see this then please reach out to the support team.

---

## Verify & Troubleshoot Sales

[Troubleshooting Sales](./manual-testing.md) — Confirm Tracking & Troubleshoot Sales

---

## FAQs

#### How Tracking Order ID from PayPal works?

#### Why is it important to use the correct payment button?

Once this is done, PayPal will send the transaction ID (labelled "tx" in the URL in the screenshot below) to the thank you page.

Our tracking script will grab this tx and associate it with the click, so that when we receive the PayPal sale we can use this information to track the sale back to the correct lead in the case that the PayPal email is not the same email that we previously tracked in their journey, despite the fact we cannot track the PayPal checkout page.
