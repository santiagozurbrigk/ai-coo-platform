---
title: "Bing Ads"
source: "https://docs.hyros.com/docs/bing-ads"
seccion: "Ad and Reporting Integrations"
capturado: "2026-08-30"
---

# Bing Ads

This guide will walk you through integrating your Bing Ads account with Hyros and setting up the necessary parameters to track which ads your leads originate from.

If you need any help, contact support or your onboarding manager. We are standing by!

If you already use existing parameters at a specific level, you must place the Hyros parameters at the same level. Otherwise, please follow the steps mentioned in this guide.

---

## First: Watch This If You Import Ads From Google or Facebook

If you import campaigns from Google or Facebook to Bing, watch this video first.

Bing allows you to import campaigns from Google Ads or Facebook. If you do this, there are special considerations for tracking parameters.

#### A. Open your auto-import

1. In Bing Ads: Imports → Import schedule and history → find your auto-import → click Edit

2. Sign in to Google, follow the prompts to Start your import, then click Advanced import

💡 You can keep importing all campaigns, or pick specific ones — either works.

#### B. Turn off tracking template updates

In the **Update existing items** section: click **Show advanced options** → scroll to **Tracking templates, custom parameters, and final URL suffixes** → toggle **OFF** → save as normal.

⚠️ **This toggle is the whole point of the fix.** Leave the other toggles however you like, but this one **must** be off — otherwise imports will keep overwriting your Hyros tracking.

---

1

## Integrate Bing Ads

#### A. Connect Bing Ads in Hyros

Go to your **integration settings** and find the **Bing Ads** integration ([link here](https://app.hyros.com/external-services/bing-ads/accounts)).

#### B. Sign in with Microsoft

1. Click Add Account → sign in with your Microsoft account → grant the required permissions

2. Select the ad account(s) you want to connect and complete the authorization

2

## Install Bing Ads Parameters

#### Bing General Parameters

text

```
{lpurl}?h_campaign_id={CampaignId}&bng_id={AdGroupId}&h_ad_id={adid}
```

#### Bing Keywords Parameters

code

```
{lpurl}?h_campaign_id={CampaignId}&bng_id={AdGroupId}&h_ad_id={AdId}&h_keyword={keyword}&h_keyword_id={TargetId}
```

#### A. Install the Parameters into your Ad Groups

1. In Microsoft Advertising: Ad Groups → select the ad groups you want to track (checkbox selects all)

2. Click Edit → Change URL options → paste the code into the Tracking Template field → Save

If other UTMs are present please connect our tracking code at the end of the existing UTMs through an ampersand sign (&) as shown in the example below

Example:

###### _ExistingUTM_**_&h_campaign_id={CampaignId}&bng_id={AdGroupId}&h_ad_id={adid}_**

3

## PMax and Shopping Campaigns Only

For PMax and Shopping campaigns, you need to use a different parameter and place it at the Campaign level in the "Tracking template" section.

#### PMax / Shopping Campaign Parameter

text

```
{lpurl}?h_campaign_id={CampaignId}&bng_special_campaign=true
```

#### A. Open your Campaign Settings

In **Microsoft Advertising**: open your **PMax** or **Shopping** campaign → **Campaign Settings.**

#### B. Install the parameter

Expand **Campaign URL options** → paste the parameter into the **Tracking Template** field → click **Save**.

---

## FAQ & Troubleshooting

#### Prefer using your existing parameters instead of adding new ones?

If you're already using existing parameters to track your ads and don't want to make changes to your active campaigns, you can use our workaround to continue tracking with your existing parameters without making any changes. Simply [**Follow this guide.**](https://docs.hyros.com/docs/utm-parameters)

If you unsure, or need assistance, please contact our Support team or follow the steps outlined above.

#### "Need Admin Approval" Error?

Please follow this guide if you are trying to integrate with Bing and see an error similar to this:

The most common cause of this error is simply not using an account that has "admin" or "super admin" access to the bing ads account that you want to track with.

Please check your account and ensure that you see "Super Admin" Under the Account Role tab and that this access is given to the same account email that you are using to create the integration. It should also have access to all of the ad accounts that you are trying to track with under the "Access to" section as seen here:

If you have checked this and are sure that the account you are using has the correct access, then there may be a different error here:

##### **If Your Organization Has Access to**[**Microsoft Azure Active Directory**](https://azure.microsoft.com/en-us/products/active-directory/)

The error is caused by User permission settings in corporate MS Azure Active Directory. Specifically, the option “_User can consent to apps accessing company data on their behalf_” is set to “_No_”, along with the setting for accessing the groups’ data, as shown here:

There are 3 ways of resolving this issue:

**Solution 1 - allow the end users to register consent for Apps on their own.**

- Log in to Azure AD using Admin credentials
- Go to Enterprise applications → User settings
- Switch the setting “_User can consent to apps accessing company data on their behalf_” to Yes![](https://tuuhjfjpdviqsrjvviom.supabase.co/storage/v1/object/public/doc-images/2026/6117c7d4-a1af-480c-811c-14c73e662a68.png)

Enabling of the setting “_User can consent to apps accessing company data for the groups they own_” is optional.

**Solution 2 - Grant Admin Consent for a Specific Application**

- Log in to MS Azure AD ([https://portal.azure.com](https://portal.azure.com)) with Admin credentials.
- Go to _Enterprise Applications._
- Select _All Applications._
- Type “_Hyros_” in the search field to find the App and select it.
![](https://tuuhjfjpdviqsrjvviom.supabase.co/storage/v1/object/public/doc-images/2026/1c41f8a5-433f-428d-abc3-d3741715ce63.png)

- In the App security settings, open the "Permissions" tab and click "Grant Admin Consent for {Company Name}".![](https://tuuhjfjpdviqsrjvviom.supabase.co/storage/v1/object/public/doc-images/2026/445abd95-2ca3-423e-b2d2-094d124c8ba5.png)
- Log in with Office 365 Admin credentials and click “_Accept_” in the “_Permissions requested”_dialog that appears.
- Refresh the page with Permissions for the application you’ve just registered consent for.
- The list of consent permissions will be displayed in the _Admin Consent_tab on the _Applications_ page.
- After that, all the users should be able to integrate with Bing inside Hyros.

**Solution 3 - Grant Access to Hyros via the Local Office 365 Admin Account**

The local Office 365 Admin can register consent for the App on the initial log-on. This method requires the Office 365 Admin to integrate in Hyros.

Setup actions to be performed by the Admin (Notice that this is not a Bing Ads admin, this is the admin of the Office 365 Subscription).

- Integrate with Office 365 Admin credentials in Hyros
- In the following “_Permissions Requested_” dialog window: select the checkbox “_Consent on behalf of your organization_” and click Accept![](https://tuuhjfjpdviqsrjvviom.supabase.co/storage/v1/object/public/doc-images/2026/88c5b6f8-174f-4ad8-8969-56771109929d.png)

If the authorization is successful, a successful notification will appear. Now the consent to use the App has been granted for the whole organization and all end users in it are allowed to integrate Hyros with Bing.

If the Office 365 subscription admin does not want to have an integration using their credentials, the previously created integration can be deleted and replaced now with anyone in that organization.

#### Do you have missing campaigns?

In this optional step, users can utilize the "Import Ads" feature to ensure that any missing campaigns in their Hyros account are imported. This feature is particularly useful for campaigns that have not been automatically synced or are missing from your Hyros dashboard. By using the import function, Hyros will detect and add these missing campaigns to your account.

If any ads in your Bing Ads account have been renamed, the "Import Ads" feature will update them in Hyros accordingly. This update only applies to the ad group and ad level. Changes made to campaign names or other higher-level entities will not be affected by this process.
