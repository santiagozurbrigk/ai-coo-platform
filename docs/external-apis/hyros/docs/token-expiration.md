---
title: "Why Does My Facebook/Google Token Expire?"
source: "https://docs.hyros.com/docs/token-expiration"
seccion: "Home > Additional Resources"
capturado: "2026-08-30"
---

# Why Does My Facebook/Google Token Expire?

Understanding token expiration for ad platforms

If you are reading this, you have likely seen a message upon logging into Hyros telling you that your token has expired.

NEW ADS WILL NOT TRACK UNTIL THIS IS DONE, SO PLEASE REVALIDATE AS SOON AS POSSIBLE TO MINIMIZE ANY DAMAGE TO TRACKING

Once you have revalidated the token, the integration should be working again. Providing the rest of the setup was completed your ads will be tracking again.

Ads will not be tracked for the period in which the token was invalid.

## What causes a token to be invalidated ?

Your Ads Manager invalidates tokens when it detects behavior it considers a security risk. Common triggers include:

- Sharing your account with many different users across different IPs
- Resetting user or admin passwords
- Changing user permissions — especially on the personal account used to integrate with Hyros

When your Ads Manager decides an account may have been compromised, it invalidates **all tokens** on that account for security — which breaks your Hyros integration.

---

#### How to fix it

The integration won't work until you **revalidate the token**:

In **Hyros**: go to your **Integrations** section and follow the prompts to revalidate the affected integration.

For Facebook

What you need to do is log into your Hyros account, then click on Settings > Integrations and click on the [Facebook integration.](https://app.hyros.com/external-services/facebook/accounts)

Then you just need to click where it says Refresh Token and this will connect Facebook with Hyros again.

For Google

What you need to do is log into your Hyros account, then click on Settings > Integrations and click on the [Google integration.](https://app.hyros.com/external-services/google-aw/accounts)

Then you just need to click on the icon that is at the side of the "Expired" Token and this will connect Google with Hyros again.

Revalidation must be done manually — there's no automatic fix.

Because token invalidation is enforced by your Ads Manager (not Hyros), the only way to restore the integration is to manually follow the revalidation prompts inside Hyros. This is required by your Ads Manager and is completely outside Hyros's control.

---

#### How to reduce future invalidations

As long as you're not regularly doing things your Ads Manager flags as a security risk (frequent password resets, permission changes, wide account sharing), token invalidation should happen very infrequently.

**For agencies specifically:**

If you use the **same personal Ads account** across all your clients, consider integrating each client with a **unique ad account belonging to that client** instead.

This minimizes the risk of a single security event invalidating tokens across all your clients at once.

---
