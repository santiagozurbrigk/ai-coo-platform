---
title: "Adjusting Tracking Domains"
source: "https://docs.hyros.com/docs/tracking-domains"
seccion: "Settings"
capturado: "2026-08-30"
---

# Adjusting Tracking Domains

Configure custom tracking domains to improve tracking accuracy and reduce ad blocking interference.

Why Use a Custom Tracking Domain

Hyros is highly accurate, but **ad blockers and anti-tracking tools** can still block default tracking scripts and skew your data. A custom tracking domain (one that matches your own website) makes the tracking script look native to your domain, making it much harder for ad blockers to detect and block.

## Should I use Multiple Domains?

Multiple domains for the same business? ❌

No. Hyros **cannot track a single lead's journey across multiple tracking domains**.

If you use different custom domains for different pages of the same business, attribution will break. Leads will look like new visitors each time they cross domains.

One domain per business? ✅

Yes. If you run **separate businesses** on different websites, set up a unique tracking domain for each one.

For a single business, use one custom tracking domain across all your pages. Mixing domains within one business will fragment your data and break cross-page attribution.

Not sure where your domain is hosted?

**Check at**[**hostingchecker.com**](http://hostingchecker.com)

Enter your domain name and it'll tell you who hosts it. You'll need this info to set up the custom domain in your hosting provider's DNS settings.

1

## Configure Tracking Domain

2

## Set Up CNAME

You can see further steps on setting up the CNAME for each specific domain provider here:

3

## Verify CNAME

4

## Custom Tracking Script

#### A. Copy the Custom Script

1. In Hyros: Settings → Tracking → Universal Script → Insert Code tab

2. In the Select Domain dropdown: choose your custom tracking domain (not Default)

3. Click Copy on the script block in the top-right

#### B. Install on Your Funnel Pages

Follow your platform's standard Universal Script setup guide (ClickFunnels, Shopify, WordPress, Kajabi, etc.) to paste this script into the `<head>` of every page you want tracked.

Already have the standard Universal Script installed?

**Replace** it with this new custom-domain version. Don't add both — running two Universal Scripts on the same page causes duplicate events and broken attribution.

You don't remember how to install the Script on your pages?

Follow the steps from [this guide.](https://docs.hyros.com/docs/standard-script)
