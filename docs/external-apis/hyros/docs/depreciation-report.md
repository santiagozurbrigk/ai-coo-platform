---
title: "Depreciation Report"
source: "https://docs.hyros.com/docs/depreciation-report"
seccion: "Performance Reports"
capturado: "2026-08-30"
---

# Depreciation Report

The Depreciation attribution model is a multi-touch system that evaluates and distributes revenue across various touchpoints in a user's journey, which smartly weighs each interaction and assigns revenue based on its impact along the journey.

---

#### Generate a Depreciation Report

In **Hyros**: **Reporting** → **Performance Report** → set **Attribution Model** to **Depreciation** → set your **Rate of Depreciation** (see example below) → choose your **time frame** → **Generate Report**.

---

#### How the Rate Works — Example

Imagine a customer's journey looks like this:

1. Click on a Bing ad (first click)

2. Click on a Google ad (middle click)

3. Click on a Facebook ad (last click)

4. Make a purchase

Here's how revenue is distributed for the same $100 sale at two different depreciation rates:

| Source | Position | 50% Rate | 90% Rate |
| --- | --- | --- | --- |
| **Facebook** | Last click | $50 (50%) | $90 (90%) |
| **Google** | Middle click | $25 (25%) | $7.50 (7.5%) |
| **Bing** | First click | $25 (25%) | $2.50 (2.5%) |

**A higher rate** means the last click dominates and earlier touches get a small share. **A lower rate** means revenue is more evenly distributed across the journey.

---
