---
title: "Google Tag Manager"
source: "https://docs.hyros.com/docs/gtm"
seccion: "Installation"
capturado: "2026-08-30"
---

# Google Tag Manager

This guide will show you how to install the Universal script in your GTM. It's essential to have GTM added on EVERY PAGE, including opt-in pages, sales pages, thank-you pages, checkout pages, and any other pages users might visit.

Please note that placing our Universal tracking script in Google Tag Manager can affect tracking performance. We highly advise to always place our tracking script at the top of the Head code of each funnel page to ensure we track at the highest possible level. The steps you need to follow are from the Standard Installation Process guide, [click here](https://docs.hyros.com/docs/standard-script) to view it.

#### A. Create a GTM account (skip if you have one)

1. Log in to Google Tag Manager → click Create Account

2. Account Name: your company name (e.g. Hyros)

3. Container Name: your website (e.g. yourstore.com)

4. Target Platform: Web

5. Scroll down and click Create

Then follow the on-screen instructions to install GTM on your website.

💡 Don't see the instructions? Open your container → **Admin** → **Install Google Tag Manager**.

#### B. Copy the Universal Script in Hyros

In Hyros: **Tracking** → **Settings** → **Universal Script** → **Google Tag Manager**, then pick an integration option.

#### C. Connect your GTM account

1. Click to add your GTM account and log in

2. Select your account, container, and the default workspace

3. Click Confirm

Grant access to the entire account when prompted — limiting access causes tracking issues later.

#### D. Verify the tag is set up correctly

In GTM, open your container → **Tags** → click the **Hyros script** tag and confirm:

- ✅ Tag Type: Custom HTML
- ✅ Trigger: All Pages (Page View)

---

## Verify & Troubleshoot the Universal script

[Troubleshoot the Universal script](./troubleshoot-the-universal-script.md) — Most Common Scenarios of Troubleshooting the Universal Tracking Script
