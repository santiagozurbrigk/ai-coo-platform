---
title: "Option A – Sending Hyros Events to your Existing Facebook Pixel"
source: "https://docs.hyros.com/docs/train-facebook-existing"
seccion: "Train Your Pixel > Facebook (Meta)"
capturado: "2026-08-30"
---

# Option A – Sending Hyros Events to your Existing Facebook Pixel

Send HYROS events to your existing Facebook pixel to fill in the gaps of what Facebook is missing.

If you have catalog campaigns and wish to optimize around Hyros events, please also view the guide "Using Hyros Events with Facebook Catalog Campaigns" in the

[Facebook setup options](https://marketplace.gohighlevel.com/docs/train-facebook)

.

1

## Configure Events to be Sent From Hyros

2

## Check Pixel Settings and Confirm Deduplication

Please note this video refers to server events from Hyros

If you have only just activated this feature, you may need to wait for some more Facebook events to be tracked in Hyros and then sent to Facebook to be able to successfully follow all of the steps.

Hyros sends events hourly so our server events will not be immediately visible.

If you notice that deduplication is "not meeting best practices" inside Facebook, then they should be able to provide more information the exact issue inside of Facebook.

Also if you have multiple Facebook pixels on your site, this will weaken deduplication.

You can also see the "Facebook Event Troubleshooting" in the [**Train Your Pixel**](https://docs.hyros.com/docs/troubleshooting-ai-pixel) section for more information and other troubleshooting steps.

3

## (Optional) Event Deduplication

Please note that by default Hyros will track Facebook's "FBP" cookie value and send this with events when it is available.

This will normally allow Facebook to deduplicate events without any extra edits to code.

**Also, note that we cannot capture the event id for deduplication for these events:**

- AddPaymentInfo
- AddToWishlist
- CompleteRegistration
- Contact
- CustomizeProduct
- Donate
- FindLocation
- InitiateCheckout
- Schedule
- Search
- StartTrial
- SubmitApplication
- Subscribe
- ViewContent
- PageView
- Login

However this step should be followed if:

- You do not want to rely on Facebook's "FBP" cookie for deduplication alone. Although this automatic method should be fairly reliable, because it relies on Facebook's cookies, deduplication may not always be successful. Use the event ID if you would like an extra layer of security to ensure deduplication occurs successfully.
- You are able to manually add the pixel to your site. This setup requires editing the pixel code used by Facebook to track standard events. As each business is different, if you are not sure how to find this, we advise using this documentation from Facebook to understand how this code should look: [https://www.facebook.com/business/help/402791146561655?id=1205376682832142](https://www.facebook.com/business/help/402791146561655?id=1205376682832142). If you have not added the pixel manually yet to your site, you will need to remove the current pixel implementation and use the Facebook documentation above to install the pixel and track your standard events manually. For example, the Purchase event code should look like this on your site, which is the part we will need to edit: `fbq('track', 'Purchase', {value: 0.00, currency: 'USD'});`

To set this up, please follow these steps:

**1. Turn on "Enable Event ID Collection"**

**2. Add the Event ID Code to the Standard Event you want to Deduplicate**

We are going to use the standard Facebook "Purchase" event example in this case, because this is the most common event that people will use with Hyros, however please ensure this is done with any other standard event you are sending Hyros events to.

First, copy this code, this is what you will need to add to the standard event code in the Facebook pixel:

javascript

```
{eventID: Math.random().toString(36).substr(2, 15)}
```

Next, find the standard event code you have manually installed on your site, it should look something like this:

javascript

```
fbq('track', 'Purchase', {value: 0.00, currency: 'USD'});
```

Paste the event ID code directly before the final curly bracket with a comma and space separating it from any previous text, just like this:

javascript

```
fbq('track', 'Purchase', {value: 0.00, currency: 'USD'}, {eventID: Math.random().toString(36).substr(2, 15)});
```

Please copy this and add the new standard event code back to your site or add the event ID to your current Purchase code in exactly the same way.

WARNING: IF YOU ARE ADDING THE EVENT ID TO ANY OTHER EVENT

As you can see above, the purchase event code has 4 "arguments" or parameters, all separated by a comma. These are broken down below:

- 'track'
- 'purchase'
- {value: 0.00, currency: 'USD'}
- {eventID: Math.random().toString(36).substr(2, 15)}

The event ID section MUST always be the 4th argument. When configuring any other event with the event ID, because there is no value or currency for most events, we must add a blank argument in the event code instead to ensure the event ID is always the 4th argument in the example of a lead event code:

javascript

```
fbq('track', 'Lead', {}, {eventID: Math.random().toString(36).substr(2, 15)});
```

You can see the extra

`{},`

above which needs to be added for other event types. Please note that if this is not done, Facebook will not be able to read the event ID and use this information for deduplication.

That will conclude the setup, please ensure you have done this with all other standard events that you are sending Hyros events to.

4

## (Optional) Send existing leads conversions

With the default configuration for sending data conversions

The existing leads will not be sent back to your ad platform, only new leads will be send back to the pixel.

As an example

- If the toggle is turned OFF, it means that the events that will be sent back will only be leads that opted in once. If the same lead opts in again from another source, then it will not be sent back offline conversion. At this stage, this lead is considered an existing lead.
- If the toggle is ON, using the example above, whenever the same lead interacts with a new source and opts in again, then the event will be sent back to your pixel.

5

## (Optional) Send lead stages events

You can also send your tracked lead stages custom event back to Meta for optimization. To do this simply enable the feature from the Conversions tab within the Meta integration:

The events will be sent custom conversion action and named based on the lead stage name.

6

## (Optional) Send leads from organic or other ad platforms

You have the option to send back to meta all the leads, calls and sales that were tracked by Hyros, from different ad platforms or organic sources.

Please note that if you enable this option to send leads from organic or other ad platform for Meta, this option will be automatically enabled for other ad platforms on which you are running ads.

Also:

- If the lead comes from a **Facebook adspend type**, it is sent only once.
- If it comes from another ad spend type where offline conversions is disabled (e.g., leads), then it won't be sent to the pixel.
- To send **Google lead events** to Facebook, the **Google integration must be enabled**.
- If a user enables sending leads to both **Meta** and **Google**, the same lead event will be sent separately to each platform (not duplicated, just one to each).
- If Google is enabled but Facebook is not, only Google leads are sent — Facebook leads won't be forwarded.

---

1. In order to send all tracked leads from organic sources or other ad platforms please toggle on the:

**- Send all lead conversions to pixel.**

Send all lead conversions into the pixel even if there is no interaction with an ad from this integration. If enabled all lead events from leads with opt-ins are sent to the pixel, otherwise, only attributed ones are sent.

2. In order to send all tracked sales and calls from organic sources or other ad platforms please toggle on the:

**- Send all sale and call conversions to pixel.**

Send all sale and call conversions into the pixel even if there is no interaction with an ad from this integration. If enabled all sale and call events from other Ad Tracking Platforms are sent to the pixel, otherwise, only attributed ones are sent.

Please note if you want to turn on these options then you need to toggle off the: "Ignore organic sources" for Leads, Sales and Calls from Settings → Tracking → Attribution

## Lead Ads

Proceed only if you use Lead ads for the optimisation of your campaigns

If you use Meta Lead generation Ads and you want Hyros to send the events back to your pixel for optimisation please enable the "Send lead ads Conversions" feature from within Integrations → Meta → Conversions
