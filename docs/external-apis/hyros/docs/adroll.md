---
title: "Adroll"
source: "https://docs.hyros.com/docs/adroll"
seccion: "Ad Platforms"
capturado: "2026-08-30"
---

# Adroll

This guide will walk you through setting up HYROS tracking parameters in your AdRoll dashboard to track which ads your leads originate from.

If you need any help, contact support or your onboarding manager. We are standing by!

1

## Install Adroll Parameter

#### Adroll Parameter

code

```
?sl=[ADROLL:CAMPAIGN_NAME]&htrafficsource=AdRoll
```

#### A. Access AdRoll Dashboard

In **AdRoll** (`adroll.com`): **Campaigns** → select your campaign → **Ads** or **Ad Groups** → select the ad → find the **Destination URL** (or **Click URL**) field.

#### B. Install Tracking Parameter

Append the Hyros parameter to the end of your destination URL → **Save**.

Example:

- Before: https://yourwebsite.com/landing-page
- After: https://yourwebsite.com/landing-page?sl=[ADROLL:CAMPAIGN_NAME]&htrafficsource=AdRoll

**URL already has parameters (contains**`?`**)?** Use `&` instead of `?` before `sl=`. Example: `yoursite.com/page?existing=param&sl=[ADROLL:CAMPAIGN_NAME]&htrafficsource=AdRoll`

#### C. Repeat for Every Ad

Update **every active ad** with the parameter and save each one. Any ad without the parameter won't be tracked.

2

## Include Custom cost

The cost for AdRoll ads is not sent to HYROS automatically. Manually importing the cost data keeps your reporting complete and accurate. Simply follow the steps below.

#### A. Access Hyros

In Hyros: **Settings** → **Tracking** → **Sources** → select your source (e.g. `Taboola Ad 1`) → **Edit**.

#### B. Add a New Custom Cost

In the edit pop-up: **Custom Cost** tab → **Add a New Cost** → fill in:

- Cost Frequency: Daily or One Time
- Cost: the real ad spend (e.g. $10)
- Start Date and End Date

#### C. Verify in Reporting

Generate a report for the date range you set. Your custom cost will appear under **Traffic Source** and **Category** for that source.

> 💡 **Example:** `$10/day` over 3 days = `$30` total spend for that source.
