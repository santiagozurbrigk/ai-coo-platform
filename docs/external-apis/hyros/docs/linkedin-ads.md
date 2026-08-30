---
title: "LinkedIn Ads"
source: "https://docs.hyros.com/docs/linkedin-ads"
seccion: "Ad and Reporting Integrations"
capturado: "2026-08-30"
---

# LinkedIn Ads

This guide will walk you through integrating your LinkedIn Ads account with Hyros and setting up the necessary parameters to track which ads your leads originate from.

If you need any help, contact support or your onboarding manager. We are standing by!

1

## Integrate LinkedIn Ads

#### A. Connect LinkedIn Ads in Hyros

1. In Hyros: profile icon → Settings & Setup → Integrations → [LinkedIn → Connect LinkedIn](https://app.hyros.com/external-services/linkedin/accounts)

2. Name the integration, sign in with your LinkedIn profile, select the ad account, and click Save

2

## Install LinkedIn Parameters

#### LinkedIn Tracking Parameter

text

```
lnk_id={{AD_SET_ID}}&h_ad_id={{AD_ID}}&h_ad_name={{AD_NAME}}
```

#### A. Install Tracking Parameter

In **LinkedIn Campaign Manager**: select your campaign → edit each ad's **destination URL** → add the Hyros parameter to the end → **Save**. Repeat for every ad.

How to attach the parameter

**URL has no parameters?** Add `?` before the Hyros parameter. **URL already has parameters (contains**`?`**)?** Add `&` before the Hyros parameter.

Cover every ad — any ad without the parameter won't be tracked.

3

## LinkedIn Lead Gen Ads

This video explains how to track LinkedIn Lead Gen ads using Zapier.

#### A. Set up the LinkedIn trigger in Zapier

1. Select LinkedIn → trigger event: New Lead Gen Form Response from Sponsored Content

2. Connect your LinkedIn account → Continue → pick your ad account → select the lead form → Continue

3. Click Test Trigger → pick any lead → Continue with Selected Record

> ⚠️ **Pick Sponsored Content, not Organic** — only Sponsored captures paid lead gen ads.

#### B. Set up the Hyros action

Search **Hyros** → select **Create Click Event** → connect your **Hyros account** → **Continue**.

#### C. Map the fields

| Field | Value |
| --- | --- |
| **Refer URL** | `www.linkedin.com` |
| **Source Link Tag** | `LinkedIn` |
| **Is Organic** | `false` |
| **Integration** | `LINKEDIN` _(all caps)_ |
| **Ad Source** | Map to your **Campaign ID** |
| **Email Address** | Map to the lead's **email** |
| **Tag** | `LinkedIn lead gen ads` |

#### D. Test and publish

Click **Test Step** → check **Leads** in Hyros for the test lead with **LinkedIn** as the source → click **Publish**.

---

## FAQ

#### Prefer using your existing parameters instead of adding new ones?

If you're already using existing parameters to track your ads and don't want to make changes to your active campaigns, you can use our workaround to continue tracking with your existing parameters without making any changes. Simply [**Follow this guide.**](https://docs.hyros.com/docs/utm-parameters)

If you unsure, or need assistance, please contact our Support team or follow the steps outlined above.

#### Missing campaigns? (Especially Engagement Ads)

###### Manually Importing Ads

This is especially useful if you have any awareness campaigns where a call to action button is not present or traffic isn’t being sent to your landing page.

Normally, as soon as a click event is tracked from an ad, it is automatically imported into Hyros along with the costs and other relevant information. However, if there is no click event to be tracked, you will need to import the ad manually into Hyros in order to receive the costs from that source.

_NOTE: This will NOT enable you to track view through conversions or associate any ads without a call to action button with purchases. It WILL allow you to track the costs associated with the ads._

To configure this, simply go to your Linked-in integration, click configure and click “Import” as shown here:
