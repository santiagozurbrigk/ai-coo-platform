---
title: "Application Tag"
source: "https://docs.hyros.com/docs/application-tag"
seccion: "General"
capturado: "2026-08-30"
---

# Application Tag

This guide will walk you through exactly how to use the Application Tag field inside the Hyros Universal Script.

1

## How it works

---

#### Why Use Application Tags

When you run **more than one funnel**, all their leads look identical in Hyros by default — you can't tell which funnel drove which results. Application tags keep each funnel separate, so you can:

- See the traffic, leads, sales, and calls from each funnel on its own
- Generate individual reports per funnel
- Identify which funnel performs best

The principle is simple: **give each funnel (or funnel stage) its own tag**, install the tagged script on the relevant pages, and Hyros labels every lead by where they came through.

---

#### The Two Most Common ways to use Application Tags

##### **Scenario 1 — Track multiple funnels separately**

Repeat the same approach with a **different tag per funnel**:

- Funnel 1 → install the `!funnel-one` script on every page of funnel 1
- Funnel 2 → install the `!funnel-two` script on every page of funnel 2

Now each funnel's leads are labeled separately, and you can compare their performance side by side.

###### **Scenario 2 — Track stages within a longer funnel**

For a longer funnel, use **different tags at different stages** to see how far leads progress:

| Stage | Tag | Install on |
| --- | --- | --- |
| **Opt-in** | `!funnel-three` | The opt-in page and the page right after it |
| **Survey completed** | `!survey-form` | The page right after the survey form |
| **Purchased** | `!checkout-page` | The thank-you page (right after checkout) |

**How this reveals progression:**

- Leads tagged `!funnel-three` opted in
- Leads who then get `!survey-form` completed the survey _(Hyros knows because they landed on the page after it)_
- Leads who then get `!checkout-page` purchased, landed on the thank you page, right after checkout page.

By comparing how many leads carry each tag, you can see exactly where in the funnel leads drop off.

Tags Explanation

The tags mentioned above (such as `!funnel-one` and `!survey-form`) are just examples.

You can name your tags anything you like, as long as they begin with an exclamation mark (`!`). Everything after the `!` is completely customizable.

---

2

## How to apply it

---

#### How the Application Tag works

The Application Tag is an **action tag** (`!`) attached to a lead the **first time** they land on a page carrying your script. It marks which funnel introduced the lead.

- Find it: Settings → Tracking → Universal Script → the Application Tag field
- Default value: !clicked
- Change it to something funnel-specific (e.g. !VSL-funnel, !free-trial) before copying the script for that funnel

---

3

## How to Generate a Report

---

#### Generate a Report

1. In Hyros: open the Reports section → Specify Attributes → Filter Leads with Tags

2. Select the funnel's tag (e.g. !funnel-one) — the one you added to that funnel's pages

3. Click Apply

The report will display metrics only for traffic from the funnel where you applied the tag.

---
