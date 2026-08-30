---
title: "iClosed"
source: "https://docs.hyros.com/docs/iclosed"
seccion: "Call Tracking"
capturado: "2026-08-30"
---

# iClosed

This guide will show you how to track iClosed calls and sales using Hyros.

If you need any help, contact support or your onboarding manager. We are standing by!

1

## Integrate iClosed

#### A. Connect iClosed

In **Hyros**: **Settings** → **Integrations** → search **iClosed** → [**Connect** iClosed](https://app.hyros.com/external-services/cart-integration/iclosed)

#### B. Configure Redirect

In **iClosed**: **AI Scheduler** → **Events** → click your event → **Confirmation Page** tab → select **Redirect to an external URL** → paste your **thank you page URL**.

## Advanced Setup

---

## Track Specific Events

Configure which events and sales to track from iClosed.

#### A. Select Events

In **iClosed**: open the integration settings.

- Track everything? Leave all events selected (the default).
- Track only specific events? Deselect all → select only the events you want.

#### B. Configure Sales Tracking (only if managed via Outcomes)

Receiving sales via a payment processor?

Integrate the payment processor (e.g. Stripe) directly inside Hyros instead — that's the most accurate path. You can skip this step if you're using a payment processor.

If you track sales through **Outcomes**, enable the option to push orders into Hyros and choose which payment types to send:

1. Won

2. Recurring

3. Deposit — for Deposit outcomes, you have two choices:

- Send deposit only → updates the call to Qualified
- Send as full Sale → creates a sale in the Hyros Sales tab

Click **Save Configuration**.

#### C. Manage your Booked Calls

In **iClosed** under **Global Data**, you can mark call outcomes:

- Qualified
- Unqualified
- No Show
- Cancelled

When a call is marked with a **sales outcome**, the sale pushes to Hyros automatically. **Cancelled** and **rescheduled** calls also reflect accordingly in Hyros.

## Configure Lead Stage Tracking

By default, leads created through the **iClosed API** are **not counted as opt-ins** inside Hyros.

This means you may see iClosed Lead Stages appearing in the Lead Journey before an Opt-in event exists. While the stages are recorded correctly, the lead will **not** be counted in your **Lead Opt-ins** metrics.

To have API-created leads counted as opt-ins:

1. Open **Settings**.

2. Navigate to **Tracking**.

3. Open **Tracking Configuration**.

4. Select the **Sales Configuration** tab.

5. Enable **Lead Opt-in API**.

Once enabled, all **future** leads created through the iClosed API will automatically be processed as opt-ins, allowing Hyros to accurately track their journey and include them in Lead reporting.

1. Under each trigger type, click the Hyros Lead Stage Mapping button next to the event you want to configure.

2. Select an existing Lead Stage from the dropdown, or type a new Lead Stage name to automatically create it in Hyros.
