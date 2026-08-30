---
title: "OnceHub"
source: "https://docs.hyros.com/docs/oncehub"
seccion: "Call Tracking"
capturado: "2026-08-30"
---

# OnceHub

This guide will show you how to track Schedule Once/OnceHub calls using Hyros.

For users who joined OnceHub after January 2025, you should check the accordion below.

## Option 1 - Set Up Redirect

Note

If you have the Schedule Once Free plan, this is the setup that you need to follow. If you are using the Schedule plan and above, please continue with setup from Option 2.

#### A. Confirm Automatic Call Rule

In **Hyros**: **Tracking** → **URL Rules** → confirm the **Automatic Call** rule is listed.

Do not delete this rule.

#### B. Access OnceHub Event

In **OnceHub** (formerly ScheduleOnce): **Event Types** → select the event you want to track → **Booking Form and Redirect** → **Automatic Redirect**.

#### C. Configure the redirect

Set up:

- Automatic Redirect: ON
- Redirect URL: your thank you page
- Send booking confirmation data to the redirect page: ON

#### D. Confirm Universal Script

Confirm if **Hyros Universal Script** is installed on your **call booking page** _and_ your **thank you page. If not,**copy the Universal script below

---

## Option 2 - Optimized call tracking for Schedule plan and above

#### A. Get API Key

In **OnceHub**: top-right **gear icon** → **API and Webhooks** → click **Copy** next to your API key.

#### B. Connect OnceHub

1. In Hyros: profile icon → Settings → Integrations → search OnceHub → click it → [Connect OnceHub → name the integration](search OnceHub →)

2. Paste the API Key from Step 1 → Add Integration

#### C. URL Rule Pop-Up

A pop-up will ask if you want to **disable the call rule**. Click **Disable Call Rule**.

## Optional Step

---

1

## Tracking specific call events only

#### A. Filter your Calendars

1. In Hyros: profile icon → Settings → Integrations → [search OnceHub →](https://app.hyros.com/external-services/cart-integration/oncehub)

2. In the Actions tab, click the gear icon to open integration settings

3. Click Add Value → select only the calendars you want to receive call events from

4. Click Save Values
