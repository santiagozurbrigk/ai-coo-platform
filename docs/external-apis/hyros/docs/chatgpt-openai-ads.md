---
title: "ChatGPT/OpenAI Ads"
source: "https://docs.hyros.com/docs/chatgpt-openai-ads"
seccion: "General"
capturado: "2026-08-30"
---

# ChatGPT/OpenAI Ads

This guide will guide you through setting up the necessary parameters to track which ChatGPT/OpenAI ads your leads originate from.

1

## Install OpenAI Parameter

### OpenAI Parameter

code

```
?sl=YOUR_AD_NAME&htrafficsource=OpenAI
```

### A. Access OpenAI Dashboard

In **OpenAI**: **Campaigns** → select your campaign → select the ad you want to track → in the right, click the **three dots -> Pencil ( Edit Ad )**to edit.

### B. install Tracking Parameter

In the ad editor, find the **Link** field → add the Hyros parameter to the end → **Save**.

> **How to fill in the parameter:****After the**`=`**sign**, put your **ad's name** — this creates a source in Hyros named after that ad**Set**`htrafficsource=OpenAI` — this groups all your OpenAI ads under one traffic source in Hyros**If you have multiple ads**, change the **ad name** for each one but keep `htrafficsource=OpenAI` the same

> ⚠️ **URL already has UTMs?** Add an `&` in front of the Hyros parameter — never `?`.

### C. Repeat for Every Ad

Update **every ad** you want to track and save each one. Any ad without the parameter won't be tracked.

2

## Include Custom Cost

The cost for ChatGPT ads is not sent to HYROS automatically. Manually importing the cost data keeps your reporting complete and accurate. Simply follow the steps below.

### A. Access Hyros

In Hyros: **Settings** → **Tracking** → **Sources** → select your source (e.g. `Open AI ad 1`) → **Edit**.

### B. Add a New Custom Cost

In the edit pop-up: **Custom Cost** tab → **Add a New Cost** → fill in:

- Cost Frequency: Daily or One Time
- Cost: the real ad spend (e.g. $10)
- Start Date and End Date

### C. Verify in Reporting

Generate a report for the date range you set. Your custom cost will appear under **Traffic Source** and **Category** for that source.

💡 **Example:** `$10/day` over 3 days = `$30` total spend for that source
