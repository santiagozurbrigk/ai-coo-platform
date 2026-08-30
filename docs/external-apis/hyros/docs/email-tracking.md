---
title: "Email Campaign Tracking"
source: "https://docs.hyros.com/docs/email-tracking"
seccion: "Traffic Sources"
capturado: "2026-08-30"
---

# Email Campaign Tracking

Follow this guide to integrate tracking into your email campaigns to determine where your leads are coming from.

#### A. Find the Parameter for Your Email Platform

In Hyros: **profile icon** → **Settings** → **Tracking** → **Sources** tab → click the **three dots** → **Email Tracking**.
You'll see a list of platforms (Mailchimp, ActiveCampaign, etc.) — copy the parameter for the one you use.

#### B. Append the Parameter to Your Email Links

Paste the parameter at the end of every link in your emails.
Example (Mailchimp):

- Before: https://yoursite.com/landing-page
- After: https://yoursite.com/landing-page?he=%EMAIL%&el=email

The exact syntax depends on your email platform. Use the one from Step A

**Link already has UTMs or other parameters?** Remove the `?` from the start of the Hyros parameter and use `&` instead.

✅ Correct: `?utm_source=newsletter&email=*|EMAIL|*`

❌ Wrong: `?utm_source=newsletter?email=*|EMAIL|*`
