---
title: "Reasons on Shopify Revenue/sales discrepancies"
source: "https://docs.hyros.com/docs/reasons-on-shopify-revenue-sales-discrepancies"
seccion: "General"
capturado: "2026-08-30"
---

# Reasons on Shopify Revenue/sales discrepancies

You may have generated a report and noticed revenue/sales discrepancies between Hyros and Shopify data. Discrepancies do not necessarily mean that tracking is incorrect. Note that all events processed within your Shopify store are automatically sent to your Hyros account.

Before troubleshooting

Confirm you've completed every step in the [**Initial Setup document**](https://docs.hyros.com/docs/shopify) and that tracking is set up correctly. If tracking is confirmed and you still see discrepancies, one of the causes below is likely the reason.

#### The six common causes of Hyros–Shopify discrepancies

---

#### Hard costs

Hyros processes the hard cost events Shopify sends — but only **shipping costs and other fees Shopify actually passes along**. Discrepancies can appear if there are hard costs Shopify doesn't send to Hyros.

---

#### Different channels

By default, Hyros tracks your **online store channel plus other channels** like POS. If you compare only your Shopify _online store_ data against Hyros, the POS data won't be included on the Shopify side — creating an apparent discrepancy that isn't really one.

---

#### Refunds appear on the sale date, not the refund date

A refund event appears in reports on the date the **original sale** was created, not the date of the refund.

**Example:** A customer buys on **October 1** and is refunded on **October 15**:

- Report for **October 15 only** → the refund **won't** appear
- Report for **October 1-10** → the refund **will** appear (dated to the original sale)

---

#### Timezone mismatch

To compare Hyros and Shopify correctly, both systems must be in the **same time zone** — otherwise sales fall into different days and your totals won't line up.

Match your ad platforms first — don't just match Shopify.

Hyros and your **ad platforms** must be in the same time zone. If your Shopify store is in a _different_ time zone than Hyros and your ad platforms, **do not change the Hyros time zone to match Shopify** — that would break your ability to compare Hyros data against your ad platforms correctly, which matters more for optimization decisions.

---

#### Recurring sale — comparing the wrong revenue column

The **"revenue"** and **"recurring revenue"** columns in Hyros do **not** represent revenue from _all_ sources. When comparing against Shopify, make sure you're using the **"total revenue"** column — that's the one that reflects all sales.

---

#### Reading reports incorrectly — organic sources excluded

When a report is generated **without organic sources included**, you won't see all the sales events Shopify processed — because sales attributed to organic traffic get left out.

- Checking Total tracked sales instead of Total revenue data: Total sales will be shown under the Total Revenue column. For the sales that were not tracked you can check out the no source traffic source.

A refund event appears in reports on the date the **original sale** was created, not the date of the refund.
