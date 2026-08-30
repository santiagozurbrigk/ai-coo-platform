---
title: "Troubleshoot the Universal script"
source: "https://docs.hyros.com/docs/troubleshoot-the-universal-script"
seccion: "General"
capturado: "2026-08-30"
---

# Troubleshoot the Universal script

1

## Script Confirmation

---

#### Check 1 — Confirm the script is on the page

1. Go to one of your pages → right-click → Inspect

2. In the Elements tab, press Cmd+F (Mac) or Ctrl+F (Windows) → search universal

3. If you see the script, it's installed on the page

---

#### Check 2 — Confirm the script is firing

Open the **Console** tab and look for **green lines containing**`UTS`. These confirm the script is actively running, not just present in the code.

---

#### Check 3 — Confirm end-to-end tracking

To be 100% sure everything works:

1. Do a real opt-in on your page (enter an email)

2. In Hyros: CRM → Leads

3. If you see the email you just opted in with, tracking is working correctly

---

2

## Troubleshooting Scenarios

---

#### Universal Script

code

```
<script>
var head = document.head;
var _hrsuts = document.createElement('script');
_hrsuts.type = 'text/javascript';
_hrsuts.src = "https://t.hyros.com/v1/lst/universal-script?ph=[PLACE-PH-VALUE-FROM-HYROS]&tag=!clicked&ref_url=" + encodeURI(document.URL) ;
head.appendChild(_hrsuts);
</script>
```

---

#### Error 1 — "No NF on page" (email not captured)

**What it means:** The email field is inside an **iframe**, not directly on the page — so the script can't reach it.

Fix

Either install the script **inside the iframe**, or pass the user's details from the iframe to the next page so the script can capture them there.

---

#### Error 2 — "BIP" (Blacklisted IP)

**What it means:** Your IP address has been blacklisted in your Hyros account, so your own visits aren't tracked.

Fix

In **Hyros**: **profile icon** → **Settings** → **Tracking** → **Tracking Configuration** → **Blacklist** → remove the IP address from the blacklist.

---

#### Error 3 — CNAME verification error

**What it means:** Your custom tracking domain's CNAME record isn't verified.

Fix

Go back to your DNS settings and **re-verify the CNAME record**.

---

#### Error 4 — "err_name_not_resolved" (DNS misconfiguration)

**What it means:** The script couldn't load because the CNAME record couldn't be resolved.

Common cause: using the main domain instead of the t. tracking subdomain.

The script may be pointing to `tracking.yourdomain.com` instead of `t.yourdomain.com`. Make sure the tracking script uses the **correct tracking domain** and that the **CNAME is fully verified**.

---

#### Error 5 — "err_blocked_by_client" (script blocked)

**What it means:** The client's browser is blocking the script — usually due to an **ad blocker**, **iOS 14+ privacy features**, or **browser privacy shields**.

Fix

Set up **custom tracking domains**, which route the script through your own domain and bypass most blockers. Search "tracking domains" in the Hyros documentation and follow the setup guide.

---
