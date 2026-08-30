---
title: "Troubleshooting - Missing Sales from Zapier"
source: "https://docs.hyros.com/docs/zapier-troubleshooting-sales"
seccion: "API & Integrations > Zapier Integration"
capturado: "2026-08-30"
---

# Troubleshooting - Missing Sales from Zapier

Fix issues with missing sales events from Zapier integrations.

#### A. Open your Zap

Go to the Zap that connects to Hyros. On the right-hand toolbar, you'll see two sections that matter for troubleshooting:

- Errors — shows current issues with the Zap
- Zap History — shows every event Zapier has tried to send

#### B. Check the Errors section

If there's an error listed, click it to see Zapier's diagnosis. The error will usually point to the exact step that failed (e.g. _"Issue with Hyros in step 3"_) — click through and review the data being passed to that step.

#### C. Check Zap History

Click **Zap History** to see every event that has run. Use the **All Statuses** filter to narrow down:

- Stopped — Zap was halted
- Errored — Zap failed to complete
- Halted — Zap was paused mid-run
- Waiting / Delayed — Zap hasn't run yet

Click any event to see the full data Zapier sent — this is where you'll usually find the cause.

#### D. Look for the most common cause: missing email

**Hyros cannot process a sale without an email address.** If the event in Zap History shows a missing or empty email field, that's your problem. Hyros needs an email to attach the sale to a lead — without it, the sale is dropped.

Fix it in one of two places:

- In your Zap: make sure the correct field is mapped to the email in the Hyros step
- In your payment processor or checkout software: make sure it's collecting and passing the customer's email with every sale (some platforms don't do this by default)

#### E. Check for other common errors

If the email is present, the issue may be one of these:

- Incorrect API key — re-check the key in your Hyros Zapier integration
- Wrong sale timestamp — make sure the sale time field is being passed correctly
- Other mapping issues — click the specific error in Zapier for the exact cause
