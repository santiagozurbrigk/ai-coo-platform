---
title: "MGID"
source: "https://docs.hyros.com/docs/mgid"
seccion: "Ad Platforms"
capturado: "2026-08-30"
---

# MGID

This guide will guide you through setting up the necessary parameters to track which MGID ads your leads originate from.

1

## Install MGID Parameter

#### MGID Parameter

code

```
?sl=YOUR_AD_NAME&htrafficsource=MGID
```

#### A. Access MGID Dashboard

In **MGID**: **Campaigns** → select your campaign → select the ad you want to track → in the right sidebar, click the **pencil icon** to edit.

#### B. Install Tracking Parameter

In the ad editor, find the **Content URL** field → add the Hyros parameter to the end → **Save**.

> **How to fill in the parameter:****After the**`=`**sign**, put your **ad's name** — this creates a source in Hyros named after that ad**Set**`htrafficsource=MGID` — this groups all your MGID ads under one traffic source in Hyros**If you have multiple ads**, change the **ad name** for each one but keep `htrafficsource=MGID` the same

> ⚠️ **URL already has UTMs?** Add an `&` in front of the Hyros parameter — never `?`.

#### C. Repeat for Every Ad

Update **every ad** you want to track and save each one. Any ad without the parameter won't be tracked.

2

## Include Custom cost

The cost for MGID ads is not sent to HYROS automatically. Manually importing the cost data keeps your reporting complete and accurate. Simply follow the steps below.

#### A. Access Hyros

In Hyros: **Settings** → **Tracking** → **Sources** → select your source (e.g. `Taboola Ad 1`) → **Edit**.

#### B. Add a New Custom Cost

In the edit pop-up: **Custom Cost** tab → **Add a New Cost** → fill in:

- Cost Frequency: Daily or One Time
- Cost: the real ad spend (e.g. $10)
- Start Date and End Date

#### C. Verify in Reporting

Generate a report for the date range you set. Your custom cost will appear under **Traffic Source** and **Category** for that source.

💡 **Example:** `$10/day` over 3 days = `$30` total spend for that source
