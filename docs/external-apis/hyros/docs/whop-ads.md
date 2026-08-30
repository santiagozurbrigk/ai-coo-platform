---
title: "Whop Ads"
source: "https://docs.hyros.com/docs/whop-ads"
seccion: "General"
capturado: "2026-08-30"
---

# Whop Ads

This guide will walk you through integrating your Whop Ads account with Hyros and setting up the necessary parameters to track which ads your leads originate from.

Tracking Script Placement

The Hyros tracking script needs to be installed on the pages your Whop ads send traffic to. Whop's own storefront pages can't host our script, so the ads should land on your page or funnel first (it can redirect to Whop right after the click).

1

## Connecting Whop Integration

Important — API key access

You need a Whop API key for the business that owns the Whop Ads account, created in the Whop dashboard under the company/account API keys section, with access to the Ads data. There is no app to authorize and no login redirect on Whop's side.

1. In Hyros, go to Settings > Integrations > Whop Ads.

2. Paste the Whop API key and click **Verify key**. Hyros checks the key and shows you which Whop company it belongs to (name and biz_... id) before anything is saved.

3. Add a label if you want a friendlier name for the account in Hyros, then save.

That's the whole setup. From there Hyros pulls the campaign, ad group and ad structure plus daily cost from Whop's Ads reporting API. The account currency is detected automatically when every campaign bills in the same currency; if the account mixes currencies, Hyros will ask you to pick one in the accounts list.

Multiple Whop Companies

If you manage more than one Whop company, connect each one with its own key. The same company can't be connected twice. If a key is rotated or revoked in Whop, update it on the existing integration rather than creating a new one (the new key has to belong to the same company).

2

## Required Tracking Parameters

Whop uses its own URL parameters.

| **Param** | **What it is** | **What Hyros builds from it** |
| --- | --- | --- |
| wacid | Whop campaign id (adcamp_...) | the campaign the source sits under |
| wasid | Whop ad group id (adgrp_...) | the source itself, this is the essential one |
| waid | Whop ad id (ad_... or xad_...) | the individual ad inside that source |

Example of a properly tagged destination URL:

```
https://your-landing-page.com/?wacid=<campaign_id>&wasid=<ad_group_id>&waid=<ad_id>
```

Practical notes

In the accounts we've looked at, Whop's ad delivery already adds these parameters to the destination URL, so usually there's nothing to configure. If you see clicks arriving without them, add them to the ad's destination URL in Whop.

Partial sets still track, just with a thinner hierarchy (for example wasid alone gives you the ad group level source without the ad breakdown).

Important — Preserve Query Parameters

Redirects, link shorteners and funnel builders in the path have to preserve query parameters, otherwise the ids are lost before our script can read them.

## What to expect once it's live

- Sources appear on their own from the first tracked click, in campaign > ad group > ad. There's no manual campaign import to run.
- Cost starts showing once the account has at least one source, and refreshes through the day. A freshly connected account with no Whop clicks yet will correctly show zero.
- Cost comes from Whop's reporting API rather than from Meta Ads Manager, so small differences against Meta reflect Whop's own reporting rather than a gap in Hyros.
