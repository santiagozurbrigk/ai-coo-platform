---
title: "Applovin/ Axon"
source: "https://docs.hyros.com/docs/applovin"
seccion: "Ad and Reporting Integrations"
capturado: "2026-08-30"
---

# Applovin/ Axon

This guide will walk you through integrating your Applovin Ads account with Hyros and setting up the necessary parameters to track which ads your leads originate from.

If you need any help, contact support or your onboarding manager. We are standing by!

1

## Integrate Applovin Ads

#### A. Copy your AppLovin Report Key

In **AppLovin**: **Account** → **Keys** → copy the **Report Key**.

#### B. Add the integration in Hyros

1. In Hyros: profile icon → Settings → Integrations → search AppLovin → Connect

2. Fill in Name (any label), Email (your AppLovin account email), and API Key (the Report Key)

3. Click Add Integration

2

## Install Tracking Parameters

#### Applovin Parameters

code

```
apl_id={CAMPAIGN_ID}&h_campaign_name={CAMPAIGN_NAME}&h_ad_id={CREATIVE_SET_ID}&h_ad_name={CREATIVE_SET}
```

#### A. Open the URL Builder

1. In Axon Ads Manager: Campaigns → find your campaign → click the pencil/edit icon

2. Go to Edit campaign → Objective → scroll to Campaign URL → under Tracking parameters, click Edit

#### B. Confirm the parameters

In the **URL Builder**, check that these are set, then click **Confirm**:

- apl_id = {CAMPAIGN_ID}
- h_ad_id = {CREATIVE_SET_ID}
- h_ad_name = {CREATIVE_SET}
- h_campaign_name = {CAMPAIGN_NAME}

Click Update Campaign button.

## FAQ

#### Prefer using your existing parameters instead of adding new ones?

If you're already using existing parameters to track your ads and don't want to make changes to your active campaigns, you can use our workaround to continue tracking with your existing parameters without making any changes. Simply [Follow this guide.](https://docs.hyros.com/docs/utm-parameters)

If you unsure, or need assistance, please contact our Support team or follow the steps outlined above.
