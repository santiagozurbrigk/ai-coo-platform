---
title: "Don't See Your Ad Source?"
source: "https://docs.hyros.com/docs/dont-see-your-ad-source"
seccion: "Ad Platforms"
capturado: "2026-08-30"
---

# Don't See Your Ad Source?

This document explains how to install custom parameters to track leads back to their specific ad source.

If you're not sure how to set it up, contact support or your onboarding manager.

1

## Install the Tracking Parameter

#### A. Build the Parameter

Add this to the end of your ad's destination URL, replacing `YourSourceName` with whatever you want the source called in Hyros (e.g. `Taboola`, `Outbrain`, `MGID`):

code

```
sl=YourSourceName
```

Example:

- Before: https://www.hyros.com
- After: https://www.hyros.com?sl=Taboola

> **URL already has parameters (contains**`?`**)?** Use `&` instead of `?` before `sl=`.

#### B. Use the URL in Your Ad

Paste the URL with the `sl=` parameter into your ad's destination field, then save and publish.

2

## Include Custom cost

The cost for ads is not sent to HYROS automatically. Manually importing the cost data keeps your reporting complete and accurate. Simply follow the steps below.

#### A. Access Hyros

In Hyros: **Settings** → **Tracking** → **Sources** → select your source (e.g. `Taboola Ad 1`) → **Edit**.

#### B. Add a New Custom Cost

In the edit pop-up: **Custom Cost** tab → **Add a New Cost** → fill in:

- Cost Frequency: Daily or One Time
- Cost: the real ad spend (e.g. $10)
- Start Date and End Date

#### C. Verify in Reporting

Generate a report for the date range you set. Your custom cost will appear under **Traffic Source** and **Category** for that source.

💡 **Example:** `$10/day` over 3 days = `$30` total spend for that source.
