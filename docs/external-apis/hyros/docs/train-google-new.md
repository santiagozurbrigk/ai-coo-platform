---
title: "Sending Hyros Events to a Brand New Google Pixel / New Conversion Action"
source: "https://docs.hyros.com/docs/train-google-new"
seccion: "Train Your Pixel"
capturado: "2026-08-30"
---

# Sending Hyros Events to a Brand New Google Pixel / New Conversion Action

This guide covers how to send events back to a brand new Google Pixel / New Conversion Action. This is the most recommended way to send events to Google.

1

## Inside Hyros

Tip:

If you want to optimize around orders please send events general action and toggle this on, just like you see in the video above.

2

## Inside Google

3

## How to optimize your Google ads using Hyros conversions

Tip:

If you want to optimize your ads based on Hyros data only if you are sending the conversions, this will NOT apply if you are sending your conversions to existing conversion actions.

---

1

## (Optional) Send existing leads conversions

With the default configuration for sending data conversions

The existing leads will not be sent back to your ad platform, only new leads will be sent back to the pixel.

As an example

- If the toggle is turned OFF, it means that the events that will be sent back will only be leads that opted in once. If the same lead opts in again from another source, then it will not be sent back offline conversion. At this stage, this lead is considered an existing lead.
- If the toggle is ON, using the example above, whenever the same lead interacts with a new source and opts in again, then the event will be sent back to your pixel.

2

## (Optional) Send lead stages events

You can also send your tracked lead stages custom conversion action back to Google for optimization. To do this simply enable the feature from the Conversion Settings tab within the Google integration:

The events will be sent custom conversion action and named based on the lead stage name.
