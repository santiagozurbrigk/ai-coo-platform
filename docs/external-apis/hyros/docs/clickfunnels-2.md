---
title: "ClickFunnels 2.0"
source: "https://docs.hyros.com/docs/clickfunnels-2"
seccion: "Integrations"
capturado: "2026-08-30"
---

# ClickFunnels 2.0

This document explains the steps required to link your ClickFunnels 2.0 account to HYROS for tracking sales events.

Please note that this is tracked slightly differently to the original ClickFunnels platform. If you are using the original ClickFunnels platform please see the ClickFunnels guide instead.

1

## Integrate CF 2.0

#### A. Integrate CF 2.0 and Copy Webhook

In **Hyros**: **profile icon** → **Settings** → **Integrations** → search [**ClickFunnels 2.0**](https://app.hyros.com/external-services/cart-integration/click_funnels_2) → click it → **gear icon** → **Get Webhook** → copy the webhook URL.

#### B. Create Webhook in CF 2.0

In **ClickFunnels 2.0**: **Workspace Settings** (bottom-left) → **Webhooks** → scroll down → **Add New Endpoint** → fill in:

- URL: paste the Hyros webhook
- Name: anything you like
- API Version: v1
- Event Types: select all of the following ↓

**All event types must be selected** for full tracking to work. Missing any of these will leave gaps in your data.

- Order Created
- Order Updated
- Contact Created
- Subscription Canceled
- Subscription Activated
- Subscription Modified
- One Time Order Invoice Paid
- Subscription Invoice Paid
- Orders Invoice Refunded

Click **Create Endpoint**.

2

## Install Hyros Script

💡 Already installed the script? Skip this step.

#### A. Copy the Universal Script

Copy the script below, or In **Hyros**: **profile icon** → **Settings** → **Tracking** → copy the **Universal Script**.

#### B. Install the Universal Script

In **ClickFunnels 2.0**: **Site** → select your site → **Edit** → scroll to **Tracking Codes** → paste the script in the **Head Code** field → **Update Site**.

## Optional Steps

1

## Tracking Lead Stages with CF 2.0

If you are integrated with CF 2.0, then you can set statuses to be sent to Hyros inside your integration here:

- Click on **Lead Stages**
- In Stage Name enter the name you want this stage to have, such, or any other name you want. In the Events list select the events to be marked, e.g. Lead_Created. This is how we mark the stage lead. Once you're done hit Save.
- To mark a lead that has made a purchase customer, we define it Customer in the Stage Name, or any other name. Then select the events that will be triggered and thus you will frame the lead customer.

Once you have added a lead stage name to any specified event, they will be sent to Hyros automatically from the integration so you can view Lead stages inside Hyros.

2

## Manually Running Customer Cards on a CF 2.0 Checkout Page

Please follow the steps above to track all your CF pages, but then blacklist any checkout pages that your sales reps may be using to avoid them being tracked and associated with the sale.

To do this, copy the URL of those checkout pages and then go to your Hyros account.

Go to

Settings → True Tracking

→ scroll down until you get to the blacklist settings and select

URL

→ Paste all the URLs of the checkouts used by your sales reps here.

If you have some leads being sent to a checkout to pay themselves, then they should do so on a SEPARATE checkout page which is NOT blacklisted.

So you should have an internal checkout page for your team to use only which is blacklisted, and another public checkout page for your leads to use only that is not blacklisted.

If you do not follow this flow, then you risk sales reps being tracked with sales by error and linking leads together, or you risk tracking being broken.

---

## Verify & Troubleshoot Sales

[Troubleshooting Sales](./manual-testing.md) — Confirm Tracking & Troubleshoot Sales

---
