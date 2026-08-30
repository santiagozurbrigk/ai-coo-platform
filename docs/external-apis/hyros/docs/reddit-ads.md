---
title: "Reddit Ads"
source: "https://docs.hyros.com/docs/reddit-ads"
seccion: "Ad and Reporting Integrations"
capturado: "2026-08-30"
---

# Reddit Ads

This guide will walk you through integrating your Reddit Ads account with Hyros and setting up the necessary parameters to track which ads your leads originate from.

If you need any help, contact support or your onboarding manager. We are standing by!

1

## Integrate Reddit Ads

#### A. Connect Reddit in Hyros

1. Navigate to Settings > Integrations in your Hyros account [-> Select Reddit.](https://app.hyros.com/external-services/reddit/accounts)

2. Click Add a New Account, name the integration, and connect your Reddit account to Hyros.

2

## Install Reddit Ads Parameters

#### Reddit Parameters

text

```
?rdt_id={{ADGROUP_ID}}&rdt_clid={{CLICK_ID}}&h_ad_id={{AD_ID}}
```

#### A. Install Tracking Parameter

In **Reddit Ads Manager**: **Ads** → click the **three dots** on an ad → **Edit Ad** → scroll to **Destination URL** → add the Hyros parameter → **Save**. Repeat for every ad you want to track.

How to attach the parameter

**URL has no parameters?** Add `?` before the Hyros parameter. **URL already has UTMs?** Add `&` before the Hyros parameter.

---

## FAQ

#### Prefer using your existing parameters instead of adding new ones?

If you're already using existing parameters to track your ads and don't want to make changes to your active campaigns, you can use our workaround to continue tracking with your existing parameters without making any changes. Simply [**Follow this guide.**](https://docs.hyros.com/docs/utm-parameters)

If you unsure, or need assistance, please contact our Support team or follow the steps outlined above.

#### Missing campaigns?

In this optional step, users can utilize the "Import Ads" feature to ensure that any missing campaigns in their Hyros account are imported.

This feature is particularly useful for campaigns that have not been automatically synced or are missing from your Hyros dashboard. By using the import function, Hyros will detect and add these missing campaigns to your account.

If any ads in your Reddit Ads account have been renamed, the "Import Ads" feature will update them in Hyros accordingly. This update only applies to the ad group and ad level. Changes made to campaign names or other higher-level entities will not be affected by this process.
