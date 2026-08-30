---
title: "HubSpot"
source: "https://docs.hyros.com/docs/hubspot"
seccion: "Integrations"
capturado: "2026-08-30"
---

# HubSpot

This document explains the steps required to link your HubSpot account to HYROS for tracking sales events.

1

## Install Hyros Script

💡 Already installed the script? Skip this step.

#### A. Copy the Universal Script

Copy the script below, or In **Hyros**: **profile icon** → **Settings** → **Tracking** → copy the **Universal Script**.

#### B. Install the Universal Script

In **HubSpot**: top-right **settings icon** → in the left menu, scroll to **Content** → **Pages** → paste the script in the **Site Header HTML** section → **Save**.

**Pick the right domain scope before saving:**

- **Specific domain:** the script will only track pages on that domain
- **Default settings (all domains):** the script tracks every domain in your HubSpot account

If you have multiple domains and want them all tracked, use **Default Settings**.

2

## Integrate Hubspot

#### A. Integrate Hubspot

In **Hyros**: **profile icon** → **Settings** → **Integrations** → search **HubSpot** → click it → [**Connect HubSpot** →](https://app.hyros.com/external-services/cart-integration/hubspot)give it a name → authorize the connection.

#### B. Set your "Won" Stage

In the new integration, click **Edit** → **Add Stage** → select the pipeline stage that represents a **closed sale** for your business → **Change Property Values** to save.

**You must set a "Won" stage or no sales will be tracked.** Hyros only counts deals as sales when they reach the stage you mark as "Won." If no stage is set, every HubSpot deal will be ignored — even completed ones.

## Optional Step

1

## Blacklist Products from Sale Processing

Within the HubSpot integration you also have the option to blacklist certain types of events. In order to enable this feature please access the HubSpot integration and click on

Edit

. Once here, scroll down and the

Add or remove products to be blacklisted from sale processing

option will be visible.

Add the value of the product you want to blacklist and click

Save values

.

[Hubspot Forms](./hubspot-forms.md) — This document provides instructions for tracking leads from embedded Hubspot forms

[Hubspot Meetings](./hubspot-meetings.md) — This documentation is for the purposes of tracking your Call events (Meetings) on Hubspot.

---

## Verify & Troubleshoot Sales

[Troubleshooting Sales](./manual-testing.md) — Confirm Tracking & Troubleshoot Sales

---
