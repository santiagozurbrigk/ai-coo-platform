---
title: "Tracking Lead Gen Forms and other ad clicks via Zapier"
source: "https://docs.hyros.com/docs/zapier-lead-gen-forms"
seccion: "API & Integrations > Zapier Integration > Adding Tags"
capturado: "2026-08-30"
---

# Tracking Lead Gen Forms and other ad clicks via Zapier

Track lead gen forms and ad clicks from platforms like LinkedIn using Zapier.

When Would I use this?

In the majority of cases, we will be able to track ad clicks by using our standard initial setup guides and internal integrations.

However there may be some specific cases where we can not track an ad click, an example being on some lead-gen ads where Hyros does not have a native connection to track this type of traffic.

An example of this would be for [LinkedIn lead-gen forms.](https://docs.hyros.com/docs/linkedin-ads)

## Tracking Setup

This specific guide will explain how to track Linked-in Lead-Gen ads via zapier, but it could be adapted for any type of traffic providing the source platform has a zapier connection which enables Hyros to receive the following information:

- Lead's email
- Source information (if it's an ad source, the IDs of the campaigns/ad groups/ads)

If that is the case, then simply adjust this guide depending on the specific platform you are trying to connect with Hyros:

1

## Set Up the Trigger

In the Trigger section, click "App & event". Select LinkedIn Ads and "New Lead Gen Form Response" from the Event field.

2

## Connect LinkedIn Account

In the Account section, connect to your LinkedIn account.

3

## Select Ad Account

In Trigger, select the LinkedIn Ad account you are using for tracking.

4

## Test the Trigger

Here you can test the trigger and then you can continue to the Action to set up Hyros.

5

## Select Hyros Action

Select Hyros Beta and choose "Create Click" from Event field.

6

## Connect Hyros Account

Connect to your Hyros account by adding the Hyros API key, which you can find here: [https://app.hyros.com/settings/general/api-keys](https://app.hyros.com/settings/general/api-keys)

7

## Add Referrer URL

If you have the link to the form available, add it in the Referrer URL field. If you do not have access to the URL form, you can also add www.linkedin.com.

8

## Add SourceLink Tag

In the "SourceLink Tag" field enter "@Linkedin" or something similar, this way it will be easy to identify your leads who came from Linked inside Hyros later.

9

## Set Is Organic

The "Is Organic" field should be "False".

10

## Set Integration Type

The "Integration Type" field should be "LINKEDIN" in upper caps.

11

## Add Ad Source ID

The "Ad Source Id" field should have the campaign ID, or the field corresponding to the campaign ID from Linked-In.

12

## Add Tag (Optional)

Optional Step: in the "Tag" field enter "!Linked-in-lead-gen" or something similar, this way it will be easy to identify your leads who came from Linked-in Lead-Gen Forms inside Hyros later.

13

## Add Email Field

Select the field corresponding to the Email of the lead from here.

14

## Date and Phone (Optional)

Date can be left blank, we will track the date of when the zapier event is sent to us automatically.

If you collect the phone number in the form, this field can be entered here.

15

## Publish

Click "Publish" to activate your Zap.
