---
title: "Twitter/ X Ads"
source: "https://docs.hyros.com/docs/twitter-ads"
seccion: "Ad and Reporting Integrations"
capturado: "2026-08-30"
---

# Twitter/ X Ads

This guide will walk you through integrating your Twitter/X Ads account with Hyros and setting up the necessary parameters to track which ads your leads originate from.

If you need any help, contact support or your onboarding manager. We are standing by!

1

## Integrate Twitter/ X Ads

#### A. Connect Twitter/X in Hyros

1. In Hyros: profile icon → Settings & Setup → Integrations [→ Twitter / X → Connect X Ads](https://app.hyros.com/external-services/twitter/accounts)

2. Name the integration, click Sign in with Twitter Ads, log in, authorize the app, select the ad account to track, and click Save

2

## Install Twitter/ X Parameters

#### Twitter/X Parameter

text

```
?twt_id=
```

#### A. Find and copy your Ad Group ID

1. In Twitter / X Ads: open your campaign → go to Ad Group level

2. Find the Ad Group ID metric and copy it — you'll need it in Step 2

💡 Don't see the Ad Group ID column? Click **Metrics** → **Customize Metrics** → enable **Ad Group ID** → **Apply**.

#### B. Add the parameter to your ad

1. Click Edit Ad Group → under Ad Group Details, click the ad you want to track

2. Scroll to the Website URL field

3. At the end of the URL, paste the Hyros parameter followed by the Ad Group ID

4. Click Save

**The Ad Group ID must be added manually.** Without it appended to the parameter, tracking won't work.

## FAQ

#### Prefer using your existing parameters instead of adding new ones?

If you're already using existing parameters to track your ads and don't want to make changes to your active campaigns, you can use our workaround to continue tracking with your existing parameters without making any changes. Simply [**Follow this guide.**](https://docs.hyros.com/docs/utm-parameters)

If you unsure, or need assistance, please contact our Support team or follow the steps outlined above.

#### How To Create A Twitter/X Ad from Scratch
