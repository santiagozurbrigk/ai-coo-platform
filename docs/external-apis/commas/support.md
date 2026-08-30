---
title: "Help & Support"
source: "https://commasdocs.com/#support"
seccion: "Herramientas y referencia"
ancla: "#support"
capturado: "2026-08-30"
---

# Help & Support

We're here to help you integrate and grow. Choose the support channel that best fits your question.

📧

Email Support

For account questions, billing issues, or anything that requires a detailed response from our team.

[support@fanbasis.com](mailto:support@fanbasis.com)

Replies within 24–48 hrs

📖

Documentation

Browse this reference guide for endpoint specs, parameter tables, and code examples for every API operation.

Always available

🐛

Bug Reports

Found something broken? Send us a bug report with the full request, response body, and any relevant error messages.

[Report a bug →](mailto:support@fanbasis.com?subject=Bug Report)

Prioritized quickly

🔑

API Key Issues

If you suspect your key is compromised, regenerate it immediately from Settings → Developer in your dashboard — no need to contact support.

Self-service

✦ Getting help faster

When contacting support about an API issue, always include: (1) the full `curl` command or request you sent, (2) the complete JSON response body, (3) the HTTP status code, and (4) your approximate account email or API key prefix (first 8 characters only — never the full key). This cuts resolution time dramatically.

### Pre-Launch Checklist

Before switching from sandbox to production, run through this checklist:

- ✓Replaced sandbox API key with live API key in all environments
- ✓Webhook endpoint is deployed at a publicly accessible HTTPS URL
- ✓Webhook signature verification is implemented and tested
- ✓Webhook handler returns HTTP 200 immediately (slow work queued async)
- ✓Idempotency logic prevents double-processing duplicate events
- ✓Error handling for 400/401/500 responses is in place
- ✓API key is stored in an environment variable — not hardcoded in source
- ✓Tested end-to-end with a real payment in production (use a small amount)
