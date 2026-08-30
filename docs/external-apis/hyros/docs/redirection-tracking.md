---
title: "Redirection Tracking"
source: "https://docs.hyros.com/docs/redirection-tracking"
seccion: "General"
capturado: "2026-08-30"
---

# Redirection Tracking

This feature is designed to help your business track ad, email and other organic clicks in cases where you can not embed the Universal script on your landing page.

Warning

Please note we use the example of using redirects to track ad traffic below, but there is risk involved with adding redirects to certain ad platforms.
Please consult each ad platform’s terms and conditions before trying to track your ads this way. Hyros assumes no responsibility over any ad account issues related to this feature.

For Google ads, please ensure you use a Google ads compliant redirect link following the steps in this guide.

The optimal way of tracking your ads is always to add the universal script to the landing page and follow the standard setup guides.

If this is not possible, then redirects are the only way to track your ads and organic sources, but you assume all risk associated with adding them this way.

A common example where the Redirection feature is useful is when lead-gen businesses direct leads to a lead form page where our universal script can’t be added to.

Typically this would break tracking, but we can use a redirect to work around this and track any source clicks.

For example, if we are redirecting our ad traffic to https://www.hyros.com/optin, but we’re not able to add our universal script to this page, then we would need to add a redirect.

---

#### A. Create the Redirect Link in Hyros

1. In Hyros: profile icon (bottom-left) → Settings → Tracking → Redirection Tracking

2. Click New Redirection and fill in:

- Name: anything you like (for your reference)
- Original URL: the untracked landing page you're sending leads to — this is where they'll end up after the redirect
- Script Domain: must exactly match the Hyros Universal Script domain used across the rest of your funnel

1. Click Add Redirection Mapping

2. Copy the generated redirection URL using the copy icon

#### B. Add the Redirect URL to your Traffic Source

Use the redirection URL as the **final/destination URL** in your ads, email, or organic sources — wherever you'd normally put your landing page URL.

Example — Facebook Ads:

Ads Manager → edit your ad → **Destination** → **Website URL** → paste the redirection URL as the destination.

The exact location varies by platform, but the principle is the same for every source: replace the untrackable landing page URL with your Hyros redirection URL.

#### C. Add your Tracking Parameters

Add the appropriate tracking parameters for whatever source you're tracking — exactly as you would with a normal Hyros URL. The redirect URL behaves identically to a regular URL on any source.

Depending on the source, parameters go in one of two places:

- Paid ads (e.g. Facebook): add the standard ad tracking parameters as advised in that platform's Hyros documentation (often via a UTM parameter field)
- Organic sources: add the parameter directly to the redirect URL — e.g. prepend the ?el= organic parameter, the same way you would on a normal organic link

---
