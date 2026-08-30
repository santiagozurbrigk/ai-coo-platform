---
title: "Involve.me"
source: "https://docs.hyros.com/docs/involve-me"
seccion: "General"
capturado: "2026-08-30"
---

# Involve.me

This document explains the steps required to track lead information from Involve.me forms into Hyros.

## Written Guide

### 1. Open Your Project

- Log in to your [Involve.me](http://Involve.me) account.
- Go to Projects and select the form you want to track.
- Click Edit.

### 2. Edit the Thank You Page

- Inside the form, hover over the Thank You Page button.
- Click the three dots → Edit.
- In the URL field, enter your thank you page URL.

### 3. Add the Email Parameter

- After the URL, type:
`?email=`

- Click Variables → scroll to Personal Data → select Email.
  - This will automatically insert the email parameter.
- ⚠️ If UTMs or other parameters are already present, use `&email=` instead of `?email=`.

### 4. Save & Add Tracking Script

- Click Save.
- Ensure your tracking script is installed on the Thank You Page URL.

### 5. Test the Setup

- Fill out the form as a customer would.
- Check the final URL — the email should appear clearly in it.
