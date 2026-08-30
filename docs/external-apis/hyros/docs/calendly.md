---
title: "Calendly"
source: "https://docs.hyros.com/docs/calendly"
seccion: "Call Tracking"
capturado: "2026-08-30"
---

# Calendly

This guide will show you how to integrate and track calls from Calendly

Please contact support or your onboarding analyst directly if you have any questions about this process.

Please note that the "Redirect to an external site" option for calendars is available only for the Standard, Teams and Enterprise Calendly plans.

#### A. Integrate Calendly

In **Hyros**: **profile icon** → **Settings** → **Integrations** → **Scheduling Platforms** → [**Calendly** →](https://app.hyros.com/external-services/cart-integration/calendly) **Add Account** (or **Connect Calendly**)

#### B. Delete URL Rule

After connecting, a pop-up will ask if you want to remove the URL rule for tracking calls. Click **Delete URL Rule**.

Pop-up didn't appear?

In Hyros: **Tracking** → **URL Rules** → find the rule containing `$call` (the name may vary) → select it → **Delete Rule**.

#### C. Configure your Calendly Event

In **Calendly**: find the calendar you want to track → click the **three dots** → **Edit** → **More Options** → **Confirmation Page**.

Configure:

- Redirect to: External page
- External page URL: your thank you page
- Pass event details to the external page: toggle ON

Click **Save Changes**.

#### D. Confirm Universal Script

- Calendar embed page — wherever the Calendly widget is embedded on your site
- Thank you page — the page Calendly redirects to after booking

Both must have the **Hyros Universal Script** installed to track the full lead journey.

## Optional Step: Tracking Specific Calls Only

Please note that by default the Calendly, Acuity and Oncehub integrations will track all call events. Use this guide if you want to track only a specific event or group of events from the integration.
