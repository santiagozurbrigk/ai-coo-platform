---
title: "Sending Hyros Events to your Existing Google Pixel / Existing Conversion Action"
source: "https://docs.hyros.com/docs/train-google-existing"
seccion: "Train Your Pixel"
capturado: "2026-08-30"
---

# Sending Hyros Events to your Existing Google Pixel / Existing Conversion Action

This guide covers how to send events back to your existing Google Pixel / Existing Conversion Action.

## Read this First

**What is an "Existing Google Conversion Action"?**

This refers to the events that Google are tracking already, most likely by the Google snippet/pixel added to your site. These are not the same events tracked inside of Hyros.

Sending Hyros events to an existing event, will in the case of the example above, send all events to "Google Conversion" instead of sending Hyros events to a separate conversion action.

If you have not been tracking events with Google prior to this, you can ignore this section and just follow the main Google guide above.

**Requirements for Setup**

It is only possible for Hyros to send events to conversion actions with an "import" source. If your existing conversion action is not imported, then you must follow the standard setup events instead.

You can check if your conversion action is an imported conversion source by checking the "conversion source" column below.

In this example, only the second conversion action that has a conversion source of "website (

**import**

from clicks)" will be able to receive events from Hyros. If your existing event has a conversion source that is not an import source then please follow the standard setup above.

---

Snippet Code

```
Math.random().toString(36).substr(2, 15)
```

Paste it with a space in front of `'transaction_id':`, and a comma at the end. It should look something like this:

**Note**

- If you send Call and Lead events back to Google you will have to complete the same setup: find the

`'transaction_id':`

section and add the same deduplication code.

Please read the written guide very carefully before setting this up. We also highly suggest reaching out to the support team to assist with the setup and ensure this is the right setup for you before moving forward.

You are responsible for any sudden changes made that may damage your optimization in Google.

---

1

## (Optional ) Send existing leads conversions

With the default configuration for sending data conversions

The existing leads will not be sent back to your ad platform, only new leads will be sent back to the pixel.

As an example

- If the toggle is turned OFF, it means that the events that will be sent back will only be leads that opted in once. If the same lead opts in again from another source, then it will not be sent back offline conversion. At this stage, this lead is considered an existing lead.
- If the toggle is ON, using the example above, whenever the same lead interacts with a new source and opts in again, then the event will be sent back to your pixel.

2

## (Optional ) Send lead stages events

You can also send your tracked lead stages custom conversion action back to Google for optimization. To do this simply enable the feature from the Conversion Settings tab within the Google integration:

The events will be sent custom conversion action and named based on the lead stage name.

## FAQ

#### How to Check if your Event is a Primary or Secondary Action

It is highly likely you already using these existing events conversion goal for optimization purposes for your existing campaigns.

If you are, then sending Hyros events to an existing Google event may be advantageous (we will explain why shortly).

This is especially true if you are using account default goals.

To understand if you are using account default goals: Start by checking if the Google event is set to "Primary" under the action optimization Column, and the "Purchases" conversion goal has the text "Account Default Goal" in the screenshot below.

You should also see the number of campaigns just next to that using the account default goals you have set:

If you want to see if any specific campaigns are using account default goals, you can click edit on any campaign in your ad manager and select "update conversion goals":

If the Google events are included in these account level goals that you are using, or you are using campaign specific goal settings with Google events, sending our data directly to these Google events will allow you to immediately use Hyros events in optimization without making any other changes.

Should everything work correctly, Hyros events will essentially "fill in the gaps" of the events Google miss, and any events that Google have already tracked correctly will simply be removed by Google to avoid duplication.

For example, var's say you have an existing conversion action tracked by Google named "Google Conversion", which is being used primary action, and is being used account default goal for all your campaigns, meaning it is already being used in optimization.

If Google track 5 sales for this event, but Hyros track 7, when we send the events to the existing "Google Conversion" event, Google will simply discard the 5 events they already tracked, but keep the 2 events and add them to "Google Conversion", allowing you to optimize around more accurate data.

If you sent these 7 Hyros events to a separate "Hyros Conversion" event, then you would not be able to simply use the "Hyros Conversion" event account default goal. This is because if you are already using Google events account default goal, doing this with Hyros events at the same time would mean optimizing around duplicated events, which could damage your optimization. Google will not deduplicate events if they are in different conversion actions.

This is why by default all separate Hyros events should be sent in "secondary" action and therefore not used in optimization:

The only way to optimize around separate Hyros events without duplication, is to optimize your campaigns using campaign specific goals, using Hyros events only. See the main Google guide above for more information on that.

This is not necessarily a bad thing, and may even work better for certain businesses. However it can take longer to test and prove better performance before seeing results. This is because you then have to switch optimization to a brand new event with no previous data, so you are starting from scratch.

If you send Hyros events to an existing event instead, this means you are optimizing around Hyros events straight away, by using Hyros events to fill in the gaps of the data Google failed to track. That way you maintain using all of the historical data you have gathered and do not have to start from scratch.
