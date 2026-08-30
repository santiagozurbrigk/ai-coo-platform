---
title: "Ontraport"
source: "https://docs.hyros.com/docs/ontraport"
seccion: "Checkouts"
capturado: "2026-08-30"
---

# Ontraport

This document explains the steps required to track Ontraport pages, forms and sales with Hyros.

1

## Integrate Ontraport

#### A. Create API Key

In **Ontraport**:

1. Top-right profile icon → Administration → Integrations

2. Select Ontraport API Instructions and Key Manager → New API Key

3. Fill in:

- Name: Hyros (or anything you like)
- Contact Owner: select the appropriate owner
- Permissions: tick all options

#### B. Connect Ontraport

1. In Hyros: profile icon → Settings → Integrations → search Ontraport → [Connect Ontraport →](https://app.hyros.com/external-services/cart-integration/ontraport)

2. Paste your API Key and App ID from Step 1 → Add Integration

2

## Install Universal Script

💡 Already installed the script? Skip this step.

#### A. Copy Universal Script

Copy the script below, or In **Hyros**: **profile icon** → **Settings** → **Tracking** → copy the **Universal Script**.

#### B. Install the Universal Script

In **Ontraport**: **Sites** → **Pages** → select the page you want to track → open in editor → **Settings** → **Custom Code** → select **Header Code** → paste the script into the **Code** field → **Save**.

3

## Tracking Ontraport Forms

If you are using SmartForms inside Ontraport, just make sure you don't embed them as an Iframe and the tracking will work fine. What this means, is that the form should not be embedded on another page. For OntraForms watch the video below:

#### A. Access Ontraport Forms

In **Ontraport**: **Automations** → **Forms** → select the form you want to track → in the form editor → left menu → **Add Block** → **Custom HTML** → click **Custom HTML Block** to add it to your form.

#### B. Install Universal Script

1. Click Edit on the new Custom HTML block → Edit Code

2. In Hyros: profile icon → Settings → Tracking → copy the Universal Script

3. Back in Ontraport: paste the script into the Code field → Save and Publish

---

## Verify & Troubleshoot Sales

[Troubleshooting Sales](./manual-testing.md) — Confirm Tracking & Troubleshoot Sales

---
