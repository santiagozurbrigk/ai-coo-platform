---
title: "Zaxaa"
source: "https://docs.hyros.com/docs/zaxaa"
seccion: "Checkouts"
capturado: "2026-08-30"
---

# Zaxaa

This document explains the steps required to link your Zaxaa account to Hyros for tracking sales events.

1

## Integrate Zaxaa

#### A. Get API Signature

In **Zaxaa**: **Settings** → **Account Settings** → switch to **Advanced View** → click **Show API Signature** → copy the key.

Make sure you're on Advanced View, not Simple View.

#### B. Connect Zaxaa

1. In Hyros: profile icon → Settings → Integrations → search Zaxaa [→ Connect Zaxaa](https://app.hyros.com/external-services/cart-integration/zaxaa)

2. Name the integration (anything you like) → paste the API Signature from Step 1 → Add Integration

2

## Install Webhook and the Universal script

#### A. Copy Webhook from Hyros

In **Hyros**: open your Zaxaa integration → **gear icon** → **Get Webhook** → copy the webhook URL.

#### B. Install Webhook

In **Zaxaa**: **Product** menu → **Manage** → select the product you want to track → **General Settings** → scroll to **Script Integration** → enable **Script Integration** → paste the Hyros webhook in the **ZPN URL** field.

#### C. Install the Universal Script to your Product Checkout

1. Copy the script below, or In Hyros: profile icon → Settings → Tracking → copy the Universal Script.

2. Back in Zaxaa: paste the script in the Checkout Page Scripts area for the same product → save

#### D. Repeat Steps 2 & 3 for every product

Apply the webhook **and** the Universal Script to every Zaxaa product you want to track. Products without both configured won't be tracked.

#### E. Install the Universal Script on your front store (global)

In **Zaxaa**: top menu → **Settings** → **Front Store Settings** → scroll to **Custom Scripts Global** → paste the Universal Script in the **Header Scripts and Codes** section → **Save Changes**.

---

## Verify & Troubleshoot Sales

[Troubleshooting Sales](./manual-testing.md) — Confirm Tracking & Troubleshoot Sales

---
