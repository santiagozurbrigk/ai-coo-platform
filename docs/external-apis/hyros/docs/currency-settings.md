---
title: "Currency Settings"
source: "https://docs.hyros.com/docs/currency-settings"
seccion: "Settings"
capturado: "2026-08-30"
---

# Currency Settings

This guide explains how to configure currency settings in your Hyros account to reflect the currencies used in your Ad platforms and sales.

**Currency Conversion and Your Revenue Cap**: Your account is billed depending on revenue tiers. If you go above the cap for your pricing tier, you will need to upgrade your subscription to continue receiving data. This is why it is VERY important to configure your inbound currency correctly.

For example, if you have your inbound currency set to USD (by default), but you're actually using pesos, Hyros will assume that number is in USD and you will reach your cap much faster than you should.

Two currency settings to understand:

- **Inbound currency** → the currency your integrations (payment processors, CRMs) send to Hyros
- **Outbound currency** → the single currency Hyros uses to display all data in your account and reports. **Must match your ad platform's currency**

#### A. Open the currency configuration

In **Hyros**: **profile icon** → **Settings** → **Tracking** → **Tracking Configuration**.

#### B. Set your Inbound Currency (account-wide default)

Choose the currency your integrations use. For example, if your payment processor reports sales in **USD**, set inbound to `USD`.

Using multiple currencies across integrations?

Set a different inbound currency per integration: **Integrations** tab → open the integration (e.g. PayPal) → **Currency** section → **Specify Currency for This Integration**. This per-integration setting overrides the account-wide default.

#### C. Set your Outbound Currency

Choose the currency Hyros will display across your account and reports.

Match this to your ad platform's currency.

If your Facebook or Google Ads accounts report in `USD` but Hyros displays `EUR`, your spend and revenue numbers won't line up when comparing platforms. Match the outbound currency to your ad accounts to keep attribution math correct.

Only one outbound currency is supported.

All Hyros reports use a single currency for clarity. If you run ad accounts in multiple currencies, you'll need to pick the one most central to your reporting.

---

## Optional Step

---

#### Custom Currency Conversion

What this does

The Custom Currency Multiplier lets you override Hyros's default exchange rate between two specific currencies — useful when you want to use a flat or business-specific conversion rate instead of market rates.

Please note that this change is not retroactive and only affects events once a Custom Value is set. Right after activation, all events will have this currency conversion rule applied and it will be kept running until it is manually deactivated, even if the real-time conversion rate changes.

#### Set up the Custom Currency Multiplier

1. In Hyros: profile icon (bottom-left) → Settings → Tracking → Tracking Configuration

2. Open Currency Configuration → click Configure

3. Click the two arrows between your currencies (e.g. USD ↔ EUR)

4. Toggle on the Custom Currency Multiplier

5. Enter the conversion rate you want Hyros to use against USD

6. Click Save
