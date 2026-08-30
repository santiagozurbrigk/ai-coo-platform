---
title: "Days Range for First Source Attribution"
source: "https://docs.hyros.com/docs/days-range-for-first-source-attribution"
seccion: "General"
capturado: "2026-08-30"
---

# Days Range for First Source Attribution

This document explains how the “Days Range for First Source Attribution” setting works inside the Hyros Scientific Report.

---

#### Where to find it

In **Hyros**: open or create a **Scientific Report** → left-hand filter panel → scroll to **Days Range for First Source Attribution**.

---

#### How it works — Example

A lead's journey:

| Date | Event |
| --- | --- |
| **May 1, 2026** | Click on **TikTok Ad 1** _(first click)_ |
| **May 7, 2026** | Click on **Post-Christmas Sale** _(last click)_ |
| **May 7, 2026** | Purchase **Feel Free Up 4** for **$400** |

The gap between first click and sale is **6 days**. The credited source changes based on the days range setting:

| Days Range Setting | Within window? | Credited Source |
| --- | --- | --- |
| **30 days** | ✅ Yes (6 ≤ 30) | **TikTok Ad 1** (first click) |
| **5 days** | ❌ No (6 > 5) | **Post-Christmas Sale** (last click) |
| **1 day** | ❌ No (6 > 1) | **Post-Christmas Sale** (last click) |

**The key insight:** The lead journey, the sale, and the sources are identical in all three scenarios. Only the setting changed — but the credited source changed completely.

---

#### Choosing the right days range

Match the setting to how your customers actually buy.

Use a longer window (15 or 30 days) when:

- You sell **high-ticket offers** ($1,000+)
- You run **webinars** or **sales call funnels**
- Customers typically take **days or weeks** to decide
- You want to credit the source that first **introduced** the lead

Use a shorter window (1 or 5 days) when:

- You sell **low-ticket** or **impulse-buy** products
- Customers often convert **same day**
- The most recent touchpoint is usually what **closed** the sale
- You want to credit the source that actually drove the purchase

---
