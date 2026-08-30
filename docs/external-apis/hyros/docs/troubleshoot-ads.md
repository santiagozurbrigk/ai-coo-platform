---
title: "Troubleshoot Ads"
source: "https://docs.hyros.com/docs/troubleshoot-ads"
seccion: "Troubleshooting"
capturado: "2026-08-30"
---

# Troubleshoot Ads

General troubleshooting guide to identify ad tracking issues with HYROS.

Download the HYROS Setup Extension and follow the steps outlined [**here**](https://docs.hyros.com/docs/hse-extension).

---

#### Option 1 — Manual tracking check

###### **A. Click a test ad and check for parameters**

Generate an **ad preview** and click it as if you were a lead. When you land on your funnel, check the **URL** for the Hyros tracking parameters for your platform (Meta in this example).

###### **B. Confirm the script is on the page**

Right-click → **Inspect** → **Console** tab. If the Hyros script is present, you'll see **green console logs**.

###### **C. Opt in and confirm the script fires**

Enter an email in the funnel's opt-in form and click outside the field. When the script fires, a new console log appears: `UTS HTE` — this means the script captured the email and created the lead.

###### **D. Verify the lead in Hyros**

In **Hyros**: **CRM** → **Leads** → find your test email → click it. You should see the full journey: the lead came from the Meta ad and opted in. Open the **Clicks** tab → open the click → check the **Tracked URL** section to confirm the ad parameters are present.

---

#### Troubleshooting Ads

If a test lead opts in but shows **no first/last source** (only the `clicked` tag), check the **Clicks** tab → **first click** → **Tracked URL**.

Scenario A — Broken parameter IDs

**The parameter IDs contain non-numeric characters.**

If the tracking IDs in the URL contain letters or symbols instead of being **numbers only**, the parameters were edited or corrupted when added to your ads.

Double-check how you added the parameters,don't modify them. You can also see the broken IDs by clicking the ad and inspecting the landing URL.

Scenario B — Parameters missing entirely (redirects / Bitly)

**Redirects and Bitly links drop your tracking parameters.**

If the Tracked URL shows **no parameters at all**, your ad is using a redirect or a Bitly-style shortened link, which strips the parameters before the lead lands.

Use the **final destination link** in your ads (the actual page with parameters) and avoid redirects or link shorteners.

---

#### Option 2 — Hyros Account Setup Extension

The Setup extension automatically checks your entire funnel and flags any tracking errors — ideal for testing new funnels or hunting down gaps.

###### **A. Install and pin the extension**

- In **Chrome** (or any Chromium browser), add the extension — it appears under your extensions at the top of the browser
- Click the **jigsaw icon** → find **Hyros Account Setup** → click the **pin** so it's pinned to your toolbar

###### **B. Connect your API key**

- In **Hyros**: **profile icon** → **Settings** → **API Keys** → copy your API key
- Click the extension → paste your **API key** → **Sync Account**

###### **C. Test your funnel**

- Pick the **type of funnel** you're tracking and follow the directions
- Add your **ad test link** — the extension begins checking your entire funnel
- Read the results:
  - **Pass** → that part of your tracking is set up correctly
  - **Error** → the extension links you to an article showing exactly how to fix it

Fix any errors, then run the test again. The extension will keep checking your whole funnel until everything passes.

---

## Resources

If your ad sources are missing parameters, see below for the correct ones based on your ads traffic sources.

[Hyros tracking parameters](./hyros-tracking-parameters.md) — Find the distinct UTM parameters used in major advertising platforms

[Creating Ad Test Links](./creating-ad-test-links.md) — Learn how to create test links to verify your ad tracking setup
