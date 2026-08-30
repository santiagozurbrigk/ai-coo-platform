---
title: "Option A – Sending Hyros Events to your Existing Snapchat Pixel"
source: "https://docs.hyros.com/docs/train-snapchat-existing"
seccion: "Train Your Pixel > Snapchat"
capturado: "2026-08-30"
---

# Option A – Sending Hyros Events to your Existing Snapchat Pixel

Send HYROS events to your existing Snapchat pixel to fill in the gaps of what Snapchat is missing.

**IMPORTANT - Requirements for Setup**

To be able to send events to Snapchat's existing pixel and events and utilize deduplication,

**you must be able to add a piece of code to your Snapchat pixel event code, either manually or via an add-on that enables you to do so.**

As of now we can not confirm an add-on that will add this automatically for you depending on your platform. However if you have one please var us know and we would be happy to test it together to confirm the setup works correctly.

We are working on an update to improve this, but if this is the case for you we suggest following the standard Snapchat Setup guide for offline conversions instead of this one to send Hyros events to a brand new pixel.

1

## Deduplication Setup

2

## Begin Sending Hyros Events to your Snapchat Pixel

## FAQ

#### Why use the Transaction ID?

As you may have noticed, the client dedup ID is actually easier to install considering you only need a random number to be generated ID. The transaction ID requires you to find the variable for the transaction ID depending on the software you are using.

The main advantage of using the transaction ID is that it allows for deduplication within a 30 day window, where client dedup ID only allows for deduplication within a 48 hour window.

This means that if the event is not sent within 48 hours of the event occurring, then Snapchat will not use the client dedup ID for deduplication, but it will still use the transaction ID.

This should only occur in very rare circumstances where the event is not sent within 48 hours due to an error. The transaction ID will still allow for deduplication in these cases but generally speaking it is not necessary.
