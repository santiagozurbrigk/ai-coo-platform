---
title: "Call Attributed Sales"
source: "https://docs.hyros.com/docs/call-attributed-sales"
seccion: "General"
capturado: "2026-08-30"
---

# Call Attributed Sales

Call Attributed Sales will allow you to configure the attribution of the call responsible for the purchase. This helps businesses analyze the impact of their phone-based sales efforts. See below how to set it up.

---

#### How Call-Attributed Sales works

By default, Hyros credits every sale to the **last source clicked before the purchase**. Call-Attributed Sales changes this behavior:

- Default attribution: Lead → Books Call → Last Click → Sale credited to Last Click
- With Call-Attributed Sales enabled: Lead → Books Call → Last Click → Sale credited to the source that drove the call

This shift matters because in sales-call businesses, the booked call is usually where the purchase is _actually_ secured — anything the lead clicks after that isn't what drove the sale.

#### Example

A lead's journey:

| Step | Event | Source |
| --- | --- | --- |
| 1 | Clicks ad | **Facebook** |
| 2 | Books a call | _(booked while still attributed to Facebook)_ |
| 3 | Clicks retargeting ad after call | **Google** |
| 4 | Purchases | — |

Default attribution

Sale credited to **Google** (last click before purchase)

With Call-Attributed Sales enabled

Sale credited to **Facebook** (the source that drove the call, which is what really closed the deal)

The lead's journey and behavior didn't change — only where the credit is assigned.

---

#### How to enable it

1. In Hyros: profile icon (bottom-left) → Settings → Tracking → Tracking Configuration → Configure

2. Under Calls Configuration, click Configure in the Call-Attributed Sales section

3. Enable the option → fill in:

- Call Tags: select the specific call tags you want this rule to apply to (if you have multiple call tags, you can limit it to just the ones where the call closes the deal)
- Max Days of Attribution: the maximum time between the call and the sale for this attribution rule to apply

Click **Save**.

---
