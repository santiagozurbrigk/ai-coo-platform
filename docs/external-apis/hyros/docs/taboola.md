---
title: "Taboola"
source: "https://docs.hyros.com/docs/taboola"
seccion: "Ad and Reporting Integrations"
capturado: "2026-08-30"
---

# Taboola

This guide will walk you through integrating your Taboola account with Hyros and setting up the necessary parameters to track which ads your leads originate from.

If you need any help, contact support or your onboarding manager. We are standing by!

1

## Install Taboola Parameter

#### Taboola Parameter

text

```
?sl={campaign_name}&htrafficsource=Taboola
```

#### A. Access Taboola Dashboard

In **Taboola Ads**: select the campaign you want to track → click the **pencil icon** to edit.

#### B. Install Tracking Parameter

Scroll to the **Tracking** section → in the **Tracking Code** field → add the Hyros parameter → **Save**.

**Taboola already includes default UTMs** (`utm_source=taboola` and `utm_medium=referral`). You have two options:

- **Keep the UTMs:** add the Hyros parameter to the end, separated with an `&`
- **Replace them:** paste the Hyros parameter over the existing UTMs

Either works — just make sure the final string uses `&` between parameters, never `?`.

#### C. Repeat for Every Campaign

Update **every active Taboola campaign** with the parameter and save each one. Any campaign without it won't be tracked.

2

## Include Custom Cost

The cost for Taboola ads is not sent to HYROS automatically. Manually importing the cost data keeps your reporting complete and accurate. Simply follow the steps below.

#### A. Access Hyros

In Hyros: **Settings** → **Tracking** → **Sources** → select your source (e.g. `Taboola Ad 1`) → **Edit**.

#### B. Add a New Custom Cost

In the edit pop-up: **Custom Cost** tab → **Add a New Cost** → fill in:

- Cost Frequency: Daily or One Time
- Cost: the real ad spend (e.g. $10)
- Start Date and End Date

#### C. Verify in Reporting

Generate a report for the date range you set. Your custom cost will appear under **Traffic Source** and **Category** for that source.

> 💡 **Example:** `$10/day` over 3 days = `$30` total spend for that source
