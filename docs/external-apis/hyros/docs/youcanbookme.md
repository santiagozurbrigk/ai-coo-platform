---
title: "YouCanBook.me"
source: "https://docs.hyros.com/docs/youcanbookme"
seccion: "Sales Call Funnel"
capturado: "2026-08-30"
---

# YouCanBook.me

This document explains the steps required to track calls from YouCanBook.me into Hyros.

#### Redirect URL Parameter

code

```
?name={FNAME}&email={EMAIL}&phone={Q3}
```

#### A. Access YouCanBook.Me

In **YouCanBookMe**: edit the call booking you want to track → **Booking Form** → **Questions**.

#### B. Find Question Titles

Each question in your booking form has a title like `q1`, `q2`, `q3`, etc. — written next to the question itself. Note which title corresponds to **Phone Number** — you'll need it in Step 3.

#### C. Set Up Redirect URL

Go to the **After Booking** page → in the **Redirect URL** field, paste the Hyros parameter (from above) and append your phone question reference.
