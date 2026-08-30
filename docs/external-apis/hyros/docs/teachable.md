---
title: "Teachable"
source: "https://docs.hyros.com/docs/teachable"
seccion: "Checkouts"
capturado: "2026-08-30"
---

# Teachable

This document explains the steps required to link your Teachable account to HYROS for tracking sales events.

1

## Integrate Teachable

Note that some users may not have access to the Liquid/HTML section at min 1:40. If this is the case, contact the Teachable support to activate this section.

#### A. Create Integration and Copy Webhook

In **Hyros**: **profile icon** → **Settings** → **Integrations** → search **Teachable** → click it → [**Connect Teachable** →](https://app.hyros.com/external-services/cart-integration/teachable) name it `Teachable` (or anything you like) → **Save Integration** → in the **Actions** tab, click the **gear icon** → **Get Webhook** → copy the webhook URL.

#### B. Install Webhook

In **Teachable**: **Settings** → **Webhooks** → **Create New Webhook** → fill in:

- Event: New Transaction
- Webhook URL: paste the Hyros webhook at the top

Scroll down and click **Create Webhook**.

2

## Install Hyros Script

#### A. Access Thank-You Page

In **Teachable**: **Courses** → select your course → **Pages** → find your **Thank You page** → **Edit**.

#### B. Install the Liquid/HTML block

On the thank-you page: **Insert New Block** → choose **Liquid/HTML** → paste the **Liquid/HTML block code**

html

```
<p id="hyros-email">{{current_user.email}}</p>
```

#### C. Install the Universal Script

Already installed the script? Skip this step

Scroll to the bottom of the thank-you page → find **Add Custom Head Code** → paste the **Universal Script** at the top → **Save**.

#### D. Repeat for Every Course

Apply both scripts to the thank-you page of **every course** you want to track sales for. Courses without the scripts won't send sale data to Hyros.

---

## Verify & Troubleshoot Sales

[Troubleshooting Sales](./manual-testing.md) — Confirm Tracking & Troubleshoot Sales

---
