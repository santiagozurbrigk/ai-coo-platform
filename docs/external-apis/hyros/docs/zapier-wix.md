---
title: "Zapier and Wix (Wix Automations)"
source: "https://docs.hyros.com/docs/zapier-wix"
seccion: "API & Integrations > Zapier Integration > Tracking Sales"
capturado: "2026-08-30"
---

# Zapier and Wix (Wix Automations)

Connect Wix stores using Zapier automation to send sales to Hyros.

Zapier invitation link

This step is no longer necessary. You can create a connection between Hyros and Wix directly from Zapier.

#### A. Set up the Wix trigger in Zapier

1. Create Zap → search the trigger app → select Wix Automations

2. Choose the event: Automation Rule (you'll create this rule in Wix in Step 2) → Continue

3. Click Sign In to connect your Wix account → Add to Site → select the Wix account to use → Continue

#### B. Create the automation rule in Wix

1. In your Wix site: Edit Site → in the editor, turn on Dev Mode (make sure it's enabled)

2. Back in your Wix account: Automations → Create an Automation → Start from Scratch

3. Configure the automation:

- App: Wix Stores
- Trigger: Store Order Placed
- Products: select All Products (or choose specific products if you only want certain ones sent to Hyros)

4. Scroll down → for the action, select Connect to Zapier → Activate

#### C. Connect the automation in Zapier

1. Back in Zapier: Set Up Trigger → click the Automation Rule field → select your automation

2. Continue → Test Trigger → confirm Zapier found the automation with its example data → Continue

#### D. Set up the Hyros action in Zapier

1. For the action app, type Hyros and select it

2. Event field → Create Sale

3. Connect your Hyros account using your API key:

Where to find your Hyros API key:

In Hyros: **Settings** → **Profile Settings** → scroll to **API Key** → **Copy API Key**. Paste it into Zapier.

#### E. Map the required fields

Map these three required fields from Wix to Hyros — these are all that's needed for the sale to send:

- Item Name → Wix's Product Name field
- Email Address → Wix's Contact Email field
- Product Price → Wix's Product Price field

#### F. Test and Publish

1. Continue → Test and Review. You should see "a sale was sent into Hyros successfully."

2. Verify in Hyros: Sales Data → Sales → after a few minutes, your test sale should appear with the matching email.

3. Publish Zap.
