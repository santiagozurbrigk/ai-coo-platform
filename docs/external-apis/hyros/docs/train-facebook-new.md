---
title: "Sending Hyros Events to a Brand New Facebook Pixel"
source: "https://docs.hyros.com/docs/train-facebook-new"
seccion: "Ad Platforms > Meta Ads"
capturado: "2026-08-30"
---

# Sending Hyros Events to a Brand New Facebook Pixel

This guide covers how to send events back to a brand new Facebook Pixel.

Note that if you go ahead with sending events to a new pixel, you will need to collect at least 30-50 events before you start testing the new pixel.

Then, you will need to test the new pixel on 1-2 ad sets against the existing pixel, until you end up seeing at least the same or better performance than your existing pixel!

1

## (Optional) Send existing leads conversions

With the default configuration for sending data conversions

The existing leads will not be sent back to your ad platform, only new leads will be sent back to the pixel.

As an example

- If the toggle is turned OFF, it means that the events that will be sent back will only be leads that opted in once. If the same lead opts in again from another source, then it will not be sent back offline conversion. At this stage, this lead is considered an existing lead.
- If the toggle is ON, using the example above, whenever the same lead interacts with a new source and opts in again, then the event will be sent back to your pixel.

2

## (Optional) Send lead stages events

You can also send your tracked lead stages custom event back to Meta for optimization. To do this simply enable the feature from the Conversions tab within the Meta integration:

The events will be sent custom conversion action and named based on the lead stage name.

3

## (Optional) Lead Ads

Proceed only if you use Lead ads for the optimisation of your campaigns

If you use Meta Lead generation Ads and you want Hyros to send the events back to your pixel for optimisation please enable the "Send lead ads Conversions" feature from within Integrations → Meta → Conversions
