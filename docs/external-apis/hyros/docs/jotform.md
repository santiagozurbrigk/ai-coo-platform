---
title: "Jotform Sales"
source: "https://docs.hyros.com/docs/jotform"
seccion: "Automation & Forms"
capturado: "2026-08-30"
---

# Jotform Sales

This document explains the steps required to link your Jotform account to Hyros for tracking sales events.

#### A. Integrate Jotform

1. In Hyros: profile icon → Settings → Integrations → search Jotform → [Connect Jotform →](https://app.hyros.com/external-services/cart-integration/jotform)

2. Click the gear icon → Get Webhook → copy the webhook URL

#### B. Access Jotform

In **Jotform**: open the product order form you want to track.

Hyros recognizes specific fields by their **unique name**, not their visible label. For each field, check its unique name:

1. Click the field → Properties → Advanced → Field Details

2. Look at the Unique Name

Required field names:

- Email field: unique name must be email (not email2, email3, etc.)
- Full Name field: unique name must be fullName (optional — only if you want names tracked)
- Payment field: must exist (Hyros recognizes any payment option type)

Field names must match exactly.

Hyros matches character-for-character — `email` works, `Email` or `email_2` will fail. If users add multiple email fields, Jotform auto-numbers them (`email2`, `email3`) — make sure your primary email field uses just `email`.

#### C. Install Webhook

In your form: **Settings** → **Integrations** → find **Webhooks** → paste the webhook from Step 1 → click **Complete Integration**.

Apply the webhook integration and field-name verification to every Jotform product form you want to track.

---

## Track Jotform Pages

[Jotform Pages](./jotform-pages.md) — This guide covers tracking lead information through application forms and tracking purchases through Jotform's purchase order forms.

---

## Verify & Troubleshoot Sales

[Troubleshooting Sales](./manual-testing.md) — Confirm Tracking & Troubleshoot Sales

---
