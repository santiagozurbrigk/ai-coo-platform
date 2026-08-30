---
title: "Sending Outbound Events Via Zapier"
source: "https://docs.hyros.com/docs/zapier-outbound-events"
seccion: "API & Integrations > Zapier Integration > Tracking Sales"
capturado: "2026-08-30"
---

# Sending Outbound Events Via Zapier

Use Hyros trigger to send data to other platforms via Zapier.

## Overview

Hyros will also appear in Zapier

Trigger

and not only Action, that way you can use Hyros events, such new sale or new call being tracked in Hyros, to initiate a zap and send data from Hyros to another software of your choice.

Click on this

[Link](https://zapier.com/app/zaps)

to access the Zapier App, then please follow the general setup steps (contained above this section) but use the Trigger instead of Action in Zapier.

## Setup Steps

From the Zap setup screen, select

App and Event > Connect account

then go to

Hyros > Settings > Profile

to get your

API key

and copy it to the required field in Zapier to complete the process:

## What Events Can Be Used for the Hyros Trigger?

When selecting a trigger event, there are currently 2 options available:

Both of these options trigger when either a call or sale

is attributed to a source

. It's important to note that if a sale or call is not attributed back to a source, the zapier will not trigger.

Sales and calls are only sent that are attributed back to a source.

## What Data Can Hyros Send?

The following data fields can be sent to other platforms via Zapier:

- **eventId** - Unique identifier for the event
- **subscriptionId** - Subscription identifier
- **type** - Either "sale.attributed" or "call.attributed"
- **date** - Date and time of the event
- **qualified** - If it's a qualified call or not (either true or false)
- **score** - Identifies if the call is qualified (1) or unqualified (0)

### Product Information

- **quantity** - Product quantity
- **price** - Includes price, hardCost, discount, refunded, and currency
- **product name** - Name of the product
- **id** - Product ID
- **product tag** - Associated product tag
- **product category** - Category name and Category ID
- **orderId** - Order identifier
- **recurring** - Whether it's a recurring purchase

### Attribution Data

Will list out the following information for each source (up to 30 sources):

- **disregarded source?** - Whether the source was disregarded
- **goal** - Attribution goal
- **sourceLinkId** - Source link identifier
- **Source name** - Name of the source
- **Source tag** - Associated source tag
- **Traffic source** - Traffic source type
- **Source category** - Category of the source
- **Is Organic?** - Whether the source is organic

### Lead Information

Will provide the following lead information:

- **First Name** - Lead's first name
- **lastName** - Lead's last name
- **joinDate** - Date the lead joined
- **UTCJoinDate** - UTC formatted join date
- **ips** - IP addresses associated with the lead
- **email** - Lead's email address
- **phoneNumbers** - Lead's phone numbers
- **tags** - Includes all source, action and sales tags the lead has in their journey

All of this data can be sent to other platforms via Zapier, providing the receiving platform has the fields to receive this information.
