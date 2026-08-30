---
title: "BigCommerce"
source: "https://docs.hyros.com/docs/bigcommerce"
seccion: "Integrations"
capturado: "2026-08-30"
---

# BigCommerce

This guide provides instructions on how to integrate your BigCommerce store with Hyros and install the Universal Script to track sales data within Hyros.

If you need any help, contact support or your onboarding manager. We are standing by!

1

## Install Hyros Script

#### A. Copy the Universal Script

1. Copy the script below, or In Hyros: profile icon → Settings → Tracking → copy the Universal Script.

#### B. Install the Universal Script in BigCommerce

In **BigCommerce**: **Storefront** → **Script Manager** → **Create a Script** → fill in:

- Name: anything you like
- Placement: Header
- Location on page: All pages
- Category: Tracking / Marketing (or any category — this is a label, not a behavior)
- Type: Script
- Script Contents: paste the Hyros Universal Script

Click **Save**.

2

## Integrate BigCommerce

#### A. Integrate BigCommerce

In **Hyros**: **profile icon** → **Settings** → **Integrations** → search **BigCommerce** [→ **Configure BigCommerce**.](https://app.hyros.com/external-services/cart-integration/bigcommerce) Leave this tab open — you'll paste your credentials here in Step 4.

#### B. Create an API Account in BigCommerce

In **BigCommerce**: **Settings** → scroll down to **Store-level API Accounts** → **Create API Account** → give it a name.

#### C. Set the API permissions

Set the following scopes to **Read-only**:

- Customers
- Information & Settings
- Orders
- Order Transactions
- Products

Leave all other scopes as their default. Click **Save**.

Don't modify the other scopes.

Changing permissions outside the list above can break the integration or grant unnecessary access. Set only the five listed above to Read-only.

After saving, BigCommerce will display your **Access Token** — copy it.

#### D. Find your Store Hash

Look at the URL of your BigCommerce admin in your browser. The string after the word `store` in the URL is your **store hash** — copy it.

**Example:**

You can also find the store hash in the file you just downloaded after saving the API:

#### E. Paste Both Values into Hyros

Back in **Hyros** (the integration you opened in Step 1):

- Paste the Access Token
- Paste the Store Hash

Save the integration.

## FAQs

#### Can I Adjust Custom Sales Status?

Configure which order status triggers a sale in Hyros.

By default Hyros is using the "awaiting fulfilment" status to register your orders inside BigCommerce in Hyros. This is the default status inside of BigCommerce for orders. If your orders use this status you can ignore this step.

This step is specifically for any businesses who have customized the statuses of their orders inside BigCommerce, or for whatever reason they do not use the "awaiting fulfilment" status when orders are paid for.

In this case, you can set a custom status here depending on your unique flow:

We suggest using the status that signifies that an order has been paid. At this stage we will be able to read the order inside Hyros providing it reaches the same status inside of BigCommerce.
