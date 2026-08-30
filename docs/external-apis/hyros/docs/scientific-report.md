---
title: "Scientific Report"
source: "https://docs.hyros.com/docs/scientific-report"
seccion: "Performance Reports"
capturado: "2026-08-30"
---

# Scientific Report

The Scientific Report merges First and Last Click attribution. Depending on the chosen time frame, it attributes each sale to the source that played the most significant role, either the first or last source in the customer journey.

---

#### Generate a Scientific Report

In **Hyros**: **Reporting** → **Create Report** → set **Attribution Model** to **Scientific** → set your **Day Range of Attribution** (see explanation below) → choose your **time frame** → **Generate Report**.

---

#### How it works — Example

With a **1-day range of attribution** set:

1. March 1 — Customer clicks an ad (first click in the journey)

2. March 7 — Customer clicks a second ad (last click before sale)

3. March 7 — Customer makes the purchase

Because the sale happened **on the same day as the last click** (within the 1-day range), this sale is credited to the **last click — the March 7 ad**.

If the same customer had instead purchased on **March 14** (8 days after the last click — beyond the 1-day range), the sale would be credited to the **first click — the March 1 ad**.

---

How the day range works

The day range is a timer that decides which ad gets credit for the sale.

- **Sale happens within the day range ?** → First Click attribution (The first ad in the journey wins)
- **Sale happens after the day range?** → Last Click attribution (The most recent ad wins)
