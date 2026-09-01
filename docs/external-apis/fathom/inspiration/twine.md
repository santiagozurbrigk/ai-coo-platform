> ## Documentation Index
> Fetch the complete documentation index at: https://developers.fathom.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Twine

> How Twine bring meeting insights into revenue workflows with the help of Fathom

[Twine](https://twine.com) is *"the easiest way to turn customer conversations into intelligence that drives growth."* By connecting directly to Fathom, Twine analyzes every sales, customer success, and support call to uncover product gaps, deal blockers, churn risks, competitor mentions, and customer love—all automatically.

The two tools work in tandem. As Dee Kulkarni, CTO of The Martec, describes it:

> “The entry point is **Twine**, and then I end up going into **Fathom** to dive deeper on our most useful calls."

This workflow gives product teams the high-level patterns, revenue context, and the nuanced details they need to make informed decisions.

<img src="https://mintcdn.com/fathom-e4df0608/ejkom8Ldz3qkbiGg/images/twine.png?fit=max&auto=format&n=ejkom8Ldz3qkbiGg&q=85&s=f1a0188183324fea5447b5dceded9cbe" alt="Twine Screenshot" width="1920" height="1080" data-path="images/twine.png" />

***

## How it works

1. **Customer connects via OAuth** — Twine uses Fathom's OAuth to let each customer securely link their Fathom account.
2. **Periodic sync** — Twine regularly fetches new meetings from Fathom's API based on the user's filters and settings.
3. **Data processed** — Twine requests transcripts and meeting metadata for each new meeting.
4. **Data enriched** — Twine uses Fathom data to power AI-driven customer intelligence.

***

## Example setup

Below is a simplified version of how Twine build their integration:

### OAuth Token Exchange

```js TypeScript theme={null}
// Exchange OAuth authorization code for access token
const api = ky.extend({
  prefixUrl: "https://api.fathom.ai/external/v1",
});

export const exchangeOAuthCodeForToken = async (
  code: string,
  redirectUri: string
) => {
  const res = await api
    .post("oauth2/token", {
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: config.FATHOM_CLIENT_ID,
        client_secret: config.FATHOM_CLIENT_SECRET,
      }),
    })
    .json();

  return zOAuthTokenResponse.parse(res);
};
```

Twine then stores the response in their secure encrypted store for each organization and handles token refresh during periodic syncs.

### Fetching Meetings

```js TypeScript theme={null}
// Fetch meetings with filters and pagination support
export const listMeetings = async (
  auth: EncryptedAuth,
  params: {
    cursor?: string,
    createdAfter: Date,
    createdBefore: Date,
  }
) => {
  const res = await api
    .get("meetings", {
      headers: authHeaders(auth),
      searchParams: {
        created_after: params.createdAfter.toISOString(),
        created_before: params.createdBefore.toISOString(),
        ...(params.cursor !== undefined
          ? { cursor: params.cursor }
          : undefined),
      },
    })
    .json();

  return z
    .object({
      limit: z.number().nullish(),
      items: z.array(
        z.object({
          title: z.string(),
          url: z.string(),
          recording_id: z.number(),
          recording_start_time: z.string().datetime(),
          recording_end_time: z.string().datetime(),
          calendar_invitees: z.array(
            z.object({
              name: z.string(),
              email: z.string(),
              is_external: z.boolean(),
            })
          ),
        })
      ),
      next_cursor: z.string().nullish(),
    })
    .parse(res);
};
```

Twine uses the calendar invitees to apply various filters to decide which call transcripts to import.

## Why it matters

With a Fathom and Twine integration, GTM and product teams can automatically get:

1. **Insights from GTM conversations shared with product teams**
   Twine transforms every Fathom-recorded call into decision-ready insights, so Product teams can finally tap into Sales and CS conversations without sifting through transcripts.
2. **Curated intelligence where you work**
   Instead of dashboards or noise, Twine delivers role-specific signals straight from Fathom calls into Slack or email — while there’s still time to act.
3. **Always-on, revenue-tied clarity**
   Twine’s purpose-built AI connects the dots across customer calls, competitors, and accounts, surfacing insights tied directly to revenue — not just generic meeting notes.

👉 [Learn more about Twine](https://twine.com).
