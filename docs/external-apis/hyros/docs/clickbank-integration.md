---
title: "ClickBank"
source: "https://docs.hyros.com/docs/clickbank-integration"
seccion: "General"
capturado: "2026-08-30"
---

# ClickBank

AFFILIATE Accounts do NOT work with this integration because they do not send any email with the purchases, so we can not attribute sales correctly. This integration is for Vendor accounts ONLY at this moment in time.

1

## Integrate ClickBank

#### A. Get Secret Key

In **ClickBank**: **Vendor Settings** → **My Site** → scroll to **Advanced Tools** → copy your **Secret Key**.

#### B. Connect ClickBank

1. In Hyros: open the [ClickBank integration](https://app.hyros.com/external-services/cart-integration/click_bank)

2. Click Create New Integration → name it ClickBank (or anything you like)

3. Paste the Secret Key from Step 1 → save

2

## Install Webhook

#### A. Install Webhook

1. In Hyros: open your ClickBank integration → Configure → Get Webhook → copy the webhook URL

2. In ClickBank: Advanced Tools → click the edit icon in the top-right of the Advanced Tools section → paste the Hyros webhook into one of the Instant Notification URL fields

NOTE: If you have not yet set up the “Instant Notification URL” inside ClickBank, you will need to get this approved first. Just click “Request Access” here instead:

3

## Track your Thank You Page

💡 Already installed the script? Skip this step.

Please attach this Universal Tracking Script in between the tags on your thank you page, the page users are sent to AFTER purchase:

---

## Verify & Troubleshoot Sales

[Troubleshooting Sales](./manual-testing.md) — Confirm Tracking & Troubleshoot Sales

---
