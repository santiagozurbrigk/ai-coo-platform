---
title: "SalesForce"
source: "https://docs.hyros.com/docs/salesforce"
seccion: "Payment Processors"
capturado: "2026-08-30"
---

# SalesForce

This document explains the steps required to link your SalesForce account to Hyros for tracking sales, leads, and refunds.

#### A. Get Site Name

In **Salesforce**: click your **profile** in the top-right → under your profile name, you'll see your site URL.

Copy only the part **before** `.my.salesforce.com`. Hyros will auto-fill the rest.

**Example:** in `yourcompany.my.salesforce.com`, you'd copy `yourcompany`.

Copy only the prefix. Not the full URL.

Pasting the full `.my.salesforce.com` string will break the connection. Hyros only needs the site name itself.

#### B. Connect Salesforce

In **Hyros**: **profile icon** → **Settings** → **Integrations** → search **Salesforce** → click it → [**Connect Salesforce** →](https://app.hyros.com/external-services/cart-integration/sales_force) paste the site name → **Next**.

#### C. Configure Mapping

Most users can use the **default configuration** here — skip ahead to "Done" if you don't have custom Salesforce objects.

If you do need custom mapping:

1. Click the gear icon on the Salesforce integration

2. Go to Mapping Configuration → Create New Mapping

3. Map each Hyros object to the corresponding Salesforce object/event:

- Order → triggers a sale in Hyros
- Lead → triggers a lead in Hyros
- Refund → triggers a refund in Hyros

What is mapping?

Mapping tells Hyros _which Salesforce event_ should create _which type of Hyros record_. For example, you can specify that a Salesforce "Closed Won" event creates an Order (and therefore a sale) in Hyros — not every status change.

---

## Additional Notes

When you get to the mapping configuration in the SalesForce setup (starting at minute 1:11), the default settings for processing orders, leads and refunds can be selected below:

You can also toggle on "status check for valid events" if you would like to process events that have a specific value in a field. For example, you could process events that are being processed instead of orders that have been paid.

If you have a lot of custom fields for a specific Sales Force Object, you may want to adjust the default fields set below under "Setup Mapping":

Any field highlighted in gold will be a mandatory field for event processing. In this example "quantity" is optional.

Each specific event type will have different Mapping options. You need to find the appropriate field inside of your SalesForce account to map it with the correct information inside of Hyros.

Most of these options should be simple, but there are some options that may require further explanations, for example:

- **ExternalID** = The ID of the order inside of SalesForce.
- **Items** = Equivalent to products sold.

If you are having difficulty setting up SalesForce, please contact your onboarding analyst or in-app support.

---

## Verify & Troubleshoot Sales

[Troubleshooting Sales](./manual-testing.md) — Confirm Tracking & Troubleshoot Sales

---
