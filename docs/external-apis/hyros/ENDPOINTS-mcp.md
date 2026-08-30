---
title: "Hyros MCP Server — referencia"
source: "https://api-docs.hyros.com/ai-context/mcp.txt"
generado_desde: "openapi/mcp.yaml"
capturado: "2026-08-30"
---

# Hyros MCP Server — referencia

El servidor MCP de Hyros, para consultar la cuenta desde un agente.

- Versión declarada: `1.0`
- Spec original: [`./openapi/mcp.yaml`](./openapi/mcp.yaml)

## Descripción del proveedor

The Hyros MCP server connects any AI client that speaks the
[Model Context Protocol](https://modelcontextprotocol.io) to your Hyros data. Once connected,
your assistant can look up leads, sales, subscriptions and attribution reports, create and
update records, and help diagnose tracking problems — acting through your own Hyros account,
with your own permissions.

The tools wrap the same platform as the REST API, so the **REST API** tab remains the reference
for what each field means, how attribution is modelled, and which values are valid. This tab
covers what is specific to MCP: how to connect, how authentication works, and which tools and
prompts the server exposes.

| | |
|---|---|
| Server URL | `https://mcp.hyros.com/mcp` (the `/mcp` path is required) |
| Transport | Streamable HTTP |
| Authentication | OAuth 2.1 with PKCE (`S256`) and dynamic client registration |
| Scope | `mcp` |
| Token delivery | `Authorization: Bearer <token>` request header only |
| Tools | 59 — 29 read-only, 30 write |
| Prompts | 1 — a guided plan you start yourself |

Read **Prerequisites** below first. If you are an AI assistant setting this up for someone, go
to **Connect me to Hyros**; if you are setting it up yourself, go to **Connecting** and pick the
tutorial for your client.

## Prerequisites

Two things are needed before the connector will return data.

**1. A Hyros account you are signed in to.** You do not have to sign in ahead of time — the
connector prompts you if there is no active session. But the account you are signed in to when
you authorize is the account your assistant will act on, so check it first if you manage more
than one.

**2. That account allowed to use Hyros MCP.** Access is granted per account and is not
self-serve, so there is nothing to switch on in the Hyros app — contact
[Hyros support](https://support.hyros.com) to have it enabled.

## Secciones del spec

### Connect me to Hyros (instructions for AI assistants)

This section is addressed to the AI assistant reading this page. If a user has asked you to
connect them to Hyros, follow these steps in order. Do not skip step 1, and do not run any
command before you have the answers from step 2.

## Step 1 — Confirm the account with the user

Ask the user to confirm that they are signed in to Hyros, **on the account they want you to act
on**, and wait for their answer. This cannot be checked from the command line, and getting it
wrong wastes the whole setup: the connector binds to whichever Hyros account the browser session
is on at the moment they authorize. There is no account picker in the sign-in flow, so if they
manage several accounts, they should open [https://app.hyros.com](https://app.hyros.com) and
confirm the active account *before* you continue.

Ask as well whether that account is allowed to use Hyros MCP. It is granted per account, not
self-serve, so they may not know — if they are unsure, say so plainly and carry on: setup is
refused until [Hyros support](https://support.hyros.com) enables it.

## Step 2 — Ask the user for a name, and a scope if their client has one

Ask in one go, offer the suggested default, and use their answers verbatim in step 3.

1. **What should the server be called?** Suggest `hyros`. The name is arbitrary — it is only a
   label used to refer to the server in commands and to prefix its tools in your output. Keep
   it lowercase with no spaces.
2. **Where should it apply?** Only ask this if their client scopes MCP servers. Claude Code,
   for example, offers `local`, `user` and `project` — suggest `user`.

| Claude Code scope | Who and where it applies |
|-------|--------------------------|
| `local` | Only this user, only the current project. The default if `--scope` is omitted |
| `user` | Only this user, in every project on the machine. Best for a personal Hyros account |
| `project` | Everyone who clones this repository — written to `.mcp.json` and committed |

> [!IMPORTANT]
> Do not choose a shared scope, such as Claude Code's `project`, on the user's behalf. It
> writes a file that gets committed and shared with their whole team, which is rarely what
> someone asking to "connect my Hyros" wants.

## Step 3 — Add the server

Pick the branch that matches the client you are running in.

**A command-line client you can run commands in.** In Claude Code, substituting the name and
scope from step 2:

```bash
claude mcp add --scope <scope> --transport http <name> https://mcp.hyros.com/mcp
```

So with the suggested defaults:

```bash
claude mcp add --scope user --transport http hyros https://mcp.hyros.com/mcp
```

**A client configured by a JSON file** — add the server to its MCP configuration. This is
Claude Code's form, in `.mcp.json` or `~/.claude.json`:

```json
{
  "mcpServers": {
    "hyros": {
      "type": "http",
      "url": "https://mcp.hyros.com/mcp"
    }
  }
}
```

> [!IMPORTANT]
> Do not paste that into a client whose config format you do not know — the wrapper key and the
> field carrying the URL both differ, and a wrong guess fails silently. VS Code uses `servers`
> instead of `mcpServers`, Codex CLI is TOML under `mcp_servers`. Use the tutorial for the
> client under **Connecting**, or ask the user what their client documents. Never invent keys.

**A graphical client.** You cannot do this yourself — adding a connector is a UI
action. Give the user the numbered steps for their client instead. Hyros is in Claude's
connector directory, so on the web, desktop or mobile they add it by name:

1. Open **Settings → Connectors**.
2. Click **Browse connectors** and search for **Hyros**.
3. Open the Hyros connector, click **Connect**, and sign in to Hyros in the window that opens.

If it does not appear in the directory for their plan, they can still add it by URL: click
**Add custom connector**, enter `https://mcp.hyros.com/mcp`, click **Add**, then **Connect**.

On a Claude Team or Enterprise plan, only an organization Owner can add the connector — see
the **Connecting** section. Point the user there rather than guessing at their plan.

**A client you do not recognise.** Do not guess at commands or menu paths. Give the user the
four facts they need and let them enter them wherever their client accepts a remote MCP
server: the URL is `https://mcp.hyros.com/mcp`, the transport is Streamable HTTP, the
authentication is OAuth (their client registers itself, so any Client ID and Secret fields
stay empty), and there is no API key to enter.

## Step 4 — Verify it registered

Check the server appears in the client's server list under the name the user chose. In Claude
Code:

```bash
claude mcp list
```

Most clients will show it as needing authentication — `! Needs authentication` in Claude Code.

> [!NOTE]
> That is the **expected** result at this point, not a failure. It means the server was
> reached and answered with an OAuth challenge. Do not try to "fix" it by re-adding the
> server, and do not add an `Authorization` header — go to step 5.

## Step 5 — Hand the sign-in to the user

Signing in happens in a browser and only the user can complete it. Tell them to trigger the
connect or authenticate action for the server in their client. Their browser opens the Hyros
sign-in page; once they approve, the status changes to connected.

In Claude Code they can run `/mcp`, select the server by the name they chose, and pick
`Authenticate`, or start it from the shell:

```bash
claude mcp login <name>
```

If they are on SSH or any session without a browser, add `--no-browser` — it prints the
authorization URL to open elsewhere, then asks them to paste the redirect URL back:

```bash
claude mcp login <name> --no-browser
```

## Step 6 — Confirm and report back

Once the user says they have authorized, call one read-only tool to prove the connection works
end to end — `hyros_get_user_info`, or a small page of leads, is enough. Then tell the user
the server name, where it applies, and that the connection is live.

> [!IMPORTANT]
> This server is OAuth-only. Never ask the user for a Hyros API key for it, never pass an
> `Authorization` header when adding it, and never put a Hyros credential into a config file.
> If you find yourself reaching for an API key, you are on the wrong path — the only
> credential step is the browser sign-in in step 5.

### Connection reference

Everything a client needs, independent of which client it is.

| | |
|---|---|
| Server URL | `https://mcp.hyros.com/mcp` |
| Transport | Streamable HTTP. Server-Sent Events (SSE) is not offered |
| Authentication | OAuth 2.1, authorization code grant with PKCE (`S256`) |
| Client registration | Dynamic (RFC 7591) — clients register themselves, so Client ID and Secret fields stay empty |
| Scope | `mcp` |
| Access token lifetime | 15 minutes |

The `/mcp` path is part of the URL. The bare host does not serve the MCP endpoint.

## What a client needs

- **Streamable HTTP transport.** A client that only speaks stdio reaches the server through the
  `mcp-remote` bridge instead — see **Other MCP clients**.
- **OAuth 2.1 with PKCE and dynamic client registration.** The server issues no API keys and no
  long-lived tokens, and there is nothing to paste into a header. A client that cannot run a
  browser-based OAuth flow itself also goes through that bridge, which performs the flow for it.

Step-by-step setup is under **Connecting**, then a section per client: **Claude**, **Codex**
and **Other MCP clients**.

### Connecting

Every client needs the same three things: the URL `https://mcp.hyros.com/mcp`, Streamable HTTP
as the transport, and a browser sign-in for OAuth. No API key is involved anywhere. The three
sections that follow — **Claude**, **Codex** and **Other MCP clients** — are that one flow
spelled out per client, and all of them assume both items in **Prerequisites**.

> [!IMPORTANT]
> Config-file shape is not portable, and a wrong guess fails silently — the server simply never
> appears. Clients disagree on the wrapper key (`mcpServers`, but `servers` in VS Code and
> `mcp_servers` in Codex CLI's TOML), on the field carrying the address (`url` in most, a separate
> Streamable HTTP field in others), and on whether `type` belongs there at all. Follow your
> client's own documentation for the wrapper and field names; only the URL comes from us.

## Enabling Hyros in a conversation

Most clients let you switch a connected server on and off per conversation, and toggle
individual tools within it. A server that is added and authenticated can still be switched off
for a given chat, so check there first if the tools do not appear. In Claude, the **`+`** button
→ **Connectors** controls the connector and the **Search and tools** menu controls individual
tools; in Claude Code, `/mcp`.

If a client's documentation disagrees with anything above, follow the client, and tell
[Hyros support](https://support.hyros.com) so we can correct it. If a client that meets the
requirements in **Connection reference** cannot connect at all, tell us which client and what it
reported.

### Claude

Claude Code, and Claude on the web, desktop and mobile.

**Claude Code.** Add the server, then authenticate:

```bash
claude mcp add --transport http hyros https://mcp.hyros.com/mcp
```

`hyros` is a name you choose; it labels the server's tools in the assistant's output and
identifies the server in later commands. Add `--scope user` to make it available in every
project, or `--scope project` to write it to a shared `.mcp.json` — without `--scope` it is
registered for the current project only.

Then run `/mcp`, select `hyros`, and choose `Authenticate`. Your browser opens the Hyros
sign-in page; approve there and the status changes to connected. `claude mcp login hyros` does
the same from the shell, and `--no-browser` prints the URL instead of opening it for SSH or
headless sessions. Check status with `claude mcp list`, or remove the server with
`claude mcp remove hyros`.

To write the config by hand instead, use `~/.claude.json` for yourself or `.mcp.json` to share
with a repository:

```json
// ~/.claude.json
{
  "mcpServers": {
    "hyros": {
      "type": "http",
      "url": "https://mcp.hyros.com/mcp"
    }
  }
}
```

`"type"` is required — an entry with a `url` and no `type` is read as a stdio server and
skipped; `"streamable-http"` works as an alias. Two things that look like a broken config but
are not: a project-scoped server in `.mcp.json` sits at `⏸ Pending approval` until you run
`claude` interactively and approve it, and in a folder you have never trusted it stays pending
until you accept the workspace trust dialog.

**Claude.ai, Desktop and mobile (Free, Pro, Max).** There is no config file to edit — Claude
Desktop's `claude_desktop_config.json` only takes local `command`/`args` servers and cannot hold
a remote URL. Hyros is in Claude's connector directory, so add it through the UI:

1. Go to **Settings → Connectors**.
2. Click **Browse connectors** and search for **Hyros**.
3. Open the Hyros connector, click **Connect**, and sign in to Hyros in the window that opens.

If Hyros does not appear in the directory for your plan, add it by URL instead: click **Add
custom connector**, enter `https://mcp.hyros.com/mcp` and click **Add** — leave the OAuth Client
ID and Secret fields in **Advanced settings** empty, as the server registers clients
automatically — then **Connect**.

**Claude Team and Enterprise.** An organization Owner enables the connector once, then each member
connects their own Hyros account:

1. **Owner:** go to **Admin settings → Connectors**, click **Browse connectors**, search for
   **Hyros**, and add it. If it is not listed, use **Add custom connector** with
   `https://mcp.hyros.com/mcp` instead.
2. **Members:** go to **Settings → Connectors**, find **Hyros** in the connector list, and click
   **Connect**.

Each member signs in with their own Hyros account, so each member's tools act on the account
they authorized with.

### Codex

OpenAI's Codex CLI.

**Codex CLI.** Add the server from the shell:

```bash
codex mcp add hyros_codex --url https://mcp.hyros.com/mcp
```

`--url` is what marks it as a Streamable HTTP server; without it Codex expects a command to
launch a local one. Codex notices the server wants OAuth and starts the flow immediately — it
opens your browser, or prints the authorization URL to open yourself — and reports
`Successfully logged in.` when you approve.

If you skip or cancel that step, run it later. `codex mcp list` shows every server with its
auth status, and `codex mcp remove` deletes one:

```bash
codex mcp login hyros_codex
codex mcp list
codex mcp remove hyros_codex
```

`codex mcp add` writes exactly this, so you can also add the server by hand — TOML, with the URL
going straight in and no `command` or `args`:

```toml
# ~/.codex/config.toml
[mcp_servers.hyros_codex]
url = "https://mcp.hyros.com/mcp"
```

### Other MCP clients

Any client not listed above, plus the `mcp-remote` bridge for those that cannot run the OAuth
flow themselves.

Add `https://mcp.hyros.com/mcp` as a remote MCP server over Streamable HTTP, leave any OAuth
Client ID and Secret fields empty, then trigger the client's connect or authenticate action and
sign in to Hyros in the browser window that opens. That is the whole flow. In a JSON config it
usually looks like this:

```json
{
  "mcpServers": {
    "hyros": {
      "type": "http",
      "url": "https://mcp.hyros.com/mcp"
    }
  }
}
```

**Clients that cannot run the OAuth flow themselves** — Cursor, Cline, Roo Code, Zed, LM Studio
and most self-built stdio hosts — reach the server through the `mcp-remote` bridge, which runs
the flow locally and proxies stdio ↔ Streamable HTTP. It needs Node 18 or newer. For Cursor,
in `~/.cursor/mcp.json` or `.cursor/mcp.json` for one project:

```json
{
  "mcpServers": {
    "hyros-cursor": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp.hyros.com/mcp"
      ]
    }
  }
}
```

### Authentication

The server uses OAuth 2.1. No API key is involved, and no Hyros credential is ever entered
into your client — you sign in on a Hyros page in your own browser.

The flow, which a compliant client performs for you:

1. The client calls `/mcp` with no token and gets a `401` naming the metadata document:

   ```
   HTTP/1.1 401 Unauthorized
   WWW-Authenticate: Bearer resource_metadata="https://mcp.hyros.com/.well-known/oauth-protected-resource/mcp"
   ```

2. It reads that document, finds the authorization server, and registers itself dynamically at
   the registration endpoint.
3. It opens the Hyros sign-in page in your browser. You sign in with your normal Hyros
   credentials, including MFA if you have it enabled. If you are already signed in to Hyros in
   that browser, you are passed straight through — you'll see a redirect and no prompt. There
   is no separate consent screen.
4. It exchanges the authorization code — protected by PKCE — for an access token, and sends
   that token as `Authorization: Bearer <token>` on every subsequent call. Tokens in query
   strings are not accepted.

Access tokens are valid for 15 minutes. Clients that register as public clients — which is
most CLI and desktop clients — are not issued a refresh token, so they repeat the flow above
when the token expires. Because step 3 passes an already-signed-in browser straight through,
this is usually silent. Clients that register with credentials receive a refresh token valid
for 30 days, rotated on each use.

## Which account you connect

The token is bound to the single Hyros account that signed in, and there is no account picker
in the flow. Because an already-signed-in browser is passed straight through, authorization
can complete without ever showing you which account it used. If you manage more than one
account, confirm the active one at [https://app.hyros.com](https://app.hyros.com) before you
connect. To move the connector to a different account, disconnect it, sign in to the account
you want, and connect again.

### Tools

The server exposes 59 tools — 29 read-only and 30 that write. Every name is prefixed
`hyros_`. They cover the same ground as the REST API and operate on the same data model, so
for what a field means or which values are valid, use the **REST API** tab. The server also
exposes one **prompt**, covered in the next section.

The list your client shows after connecting is always the authoritative one: it is served by
the connector, and what you see can depend on what your account has access to. In Claude Code,
`/mcp` and select the server; in Claude on the web, desktop or mobile, the **Search and tools**
menu in a conversation. You can also just ask your assistant what it can do with Hyros — it
reads the descriptions the server publishes.

Every tool declares whether it only reads data. Compliant clients use that to decide when to
ask you to confirm a call: read-only tools can be allowed to run without a prompt, while tools
that change data prompt each time. The **Access** column below is that declaration.

## Leads

| Tool | Access | What it does |
|------|--------|--------------|
| `hyros_get_leads` | Read-only | Retrieve leads with optional filters |
| `hyros_get_lead_journey` | Read-only | Retrieve the click and attribution journey — sales, calls, carts, subscriptions and linked leads — for one or more leads, by ID and/or email. Optionally includes the full event timeline |
| `hyros_get_lead_clicks` | Read-only | Retrieve clicks belonging to a lead |
| `hyros_create_lead` | Write | Create a new lead |
| `hyros_update_lead` | Write | Update an existing lead |
| `hyros_delete_lead` | Write — deletes data | Permanently delete a lead by ID or email |

## Sales and orders

| Tool | Access | What it does |
|------|--------|--------------|
| `hyros_get_sales` | Read-only | Retrieve sales with optional filters |
| `hyros_update_sale` | Write | Update sales by their IDs |
| `hyros_delete_sale` | Write — deletes data | Delete a sale by its ID |
| `hyros_create_order` | Write | Create a new order, creating the lead if it does not exist |
| `hyros_update_order` | Write | Update an existing order by its ID |
| `hyros_refund_order` | Write | Refund an order by its ID and update the lead's income |

## Carts, subscriptions and calls

| Tool | Access | What it does |
|------|--------|--------------|
| `hyros_get_carts` | Read-only | Retrieve carts with optional filters |
| `hyros_create_cart` | Write | Create a new cart |
| `hyros_update_cart` | Write | Update an existing cart by its cart ID |
| `hyros_get_subscriptions` | Read-only | Retrieve subscriptions with optional filters |
| `hyros_create_subscription` | Write | Create a subscription, creating the lead if it does not exist |
| `hyros_update_subscription` | Write | Update subscriptions by their IDs |
| `hyros_get_calls` | Read-only | Retrieve calls with optional filters |
| `hyros_create_call` | Write | Create a new call |
| `hyros_update_call` | Write | Update calls by their IDs |
| `hyros_delete_call` | Write — deletes data | Delete a call by its ID |

## Clicks

| Tool | Access | What it does |
|------|--------|--------------|
| `hyros_create_click` | Write | Register a manual click |

## Products

| Tool | Access | What it does |
|------|--------|--------------|
| `hyros_get_products` | Read-only | Retrieve products with optional filters |
| `hyros_create_product` | Write | Create a new product |
| `hyros_update_product` | Write | Update a product by its ID; only the provided fields are modified |
| `hyros_delete_product` | Write — deletes data | Delete a product by its ID |

## Sources, ads and keywords

| Tool | Access | What it does |
|------|--------|--------------|
| `hyros_get_sources` | Read-only | Retrieve source links (ad sources) for the account |
| `hyros_get_ads` | Read-only | Retrieve ads (ad-level sources) for the account |
| `hyros_get_keywords` | Read-only | Retrieve keywords tracked in the account |
| `hyros_create_source` | Write | Create a new source link |
| `hyros_update_source` | Write | Update an existing source link, identified by its tag |
| `hyros_delete_source` | Write — deletes data | Delete a source link by its tag |

## Tags and stages

| Tool | Access | What it does |
|------|--------|--------------|
| `hyros_get_tags_count` | Read-only | Retrieve tags with the number of leads for each, filterable by name and paginated. Preferred tool for listing tags |
| `hyros_get_tags` | Read-only | Retrieve all tags defined in the account. Deprecated in favour of `hyros_get_tags_count` |
| `hyros_get_stages` | Read-only | Retrieve lead stages defined in the account |

## Costs

| Tool | Access | What it does |
|------|--------|--------------|
| `hyros_get_custom_costs` | Read-only | Retrieve custom costs with optional filters |
| `hyros_create_custom_cost` | Write | Create a custom cost entry |
| `hyros_update_custom_cost` | Write | Update a custom cost by its ID; the provided fields fully replace the current values |
| `hyros_delete_custom_cost` | Write — deletes data | Delete a custom cost by its ID |

## Attribution and ad accounts

| Tool | Access | What it does |
|------|--------|--------------|
| `hyros_get_roas_report` | Read-only | Retrieve the ROAS of a single ad, ad set, campaign or ad account for a date range, from the cash Hyros attributes to it |
| `hyros_get_attribution_report` | Read-only | Retrieve the ads attribution report |
| `hyros_get_ad_account_report` | Read-only | Retrieve the ad account attribution report |
| `hyros_get_ad_accounts` | Read-only | Retrieve the ad accounts connected to the account, all of them or only the IDs you ask for |

## Tracking script and diagnostics

| Tool | Access | What it does |
|------|--------|--------------|
| `hyros_get_account_tracking_script` | Read-only | Retrieve the Hyros tracking script for the account |
| `hyros_get_tracking_script_with_custom_domain` | Read-only | Retrieve the tracking script for the account using a custom domain |
| `hyros_get_domains` | Read-only | Retrieve the verified domains associated with the account |
| `hyros_assert_script_presence_on_domain` | Read-only | Check whether the tracking script is present on a domain |
| `hyros_get_tracking_script` | Write | Retrieve the tracking script; when tracking parameters are supplied it also saves them as the account's tracking preference |

To diagnose broken tracking links, use the `hyros_diagnose_tracking` **prompt** — see **Prompts**
below. It is not a tool: you start it, and your assistant then works through the plan using the
read-only tools above.

## Integrations and documentation

| Tool | Access | What it does |
|------|--------|--------------|
| `hyros_get_integrations_types` | Read-only | Retrieve the available external integration types |
| `hyros_get_active_external_integrations` | Read-only | Retrieve the account's active external integrations |
| `hyros_check_tracking_parameters_for_integrations` | Read-only | Check whether tracking parameters for the active integrations are valid |
| `hyros_search_hyros_docs` | Read-only | Retrieve official Hyros documentation for setting up or integrating an external platform |

## Account

| Tool | Access | What it does |
|------|--------|--------------|
| `hyros_get_user_info` | Read-only | Retrieve the user profile, connected accounts and tracking configuration |

### Prompts

Alongside its tools, the server publishes one **prompt**. A prompt is not something your
assistant can decide to call — it is a ready-made request that *you* start, and your client
surfaces it as an action you pick. Choosing it drops a written-out plan into the conversation as
though you had typed it, and your assistant then carries the plan out using the tools above.

Prompts read no data of their own and change nothing. Everything they cause to happen is a
normal tool call, subject to the same permissions and confirmation prompts as any other.

| Prompt | Argument | What it does |
|--------|----------|--------------|
| `hyros_diagnose_tracking` | `time_range_default_today` — optional, defaults to `today` | Guided plan to diagnose broken tracking links: list your sales for the time range, keep the ones with no first *and* no last source, resolve each one's lead, check the ad platform on the lead's tags against your active integrations, pull each lead's click history, and report the distinct URLs that have no source link and are therefore breaking attribution |

The argument takes a date range in plain language relative to today — `yesterday`, `this week`,
`last 7 days`, `last month`, `all time`. Leave it empty for today.

How you start a prompt depends on the client, and not every client supports them. In Claude Code
they are slash commands namespaced by the server — `/mcp__hyros__hyros_diagnose_tracking`; in
Claude on the web, desktop and mobile, the **`+`** button lists them under the connector. If your
client shows no prompts at all, it has not implemented the prompts part of the protocol — ask
your assistant to diagnose your tracking in your own words instead, and it will use the same
tools.

### Rate limits and errors

## Rate limits

Tool calls are rate limited per Hyros account, with the same defaults as the REST API:
**30 requests per second** and **1000 requests per minute**. Limits can be raised or lowered
per account, so treat the response headers rather than these numbers as the source of truth:

| Header | Meaning |
|--------|---------|
| `X-RateLimit-Limit` | The policy in effect |
| `X-RateLimit-Remaining` | Requests left in the current window |
| `X-RateLimit-Reset` | Unix timestamp (seconds) when the window resets |
| `Retry-After` | Seconds to wait, sent when a request is rejected |

Over the limit, the server answers `429` with
`{"error":"You have reached the MCP request limit, please wait before sending again."}`. This
is the one error most likely to appear during a long analysis session, where an assistant
pages through leads or sales; if you hit it, ask for a narrower date range or fewer pages.

## Writes are asynchronous

A successful result from a write tool means the request was accepted and validated. The change
is applied shortly afterwards — typically within about ten seconds — so it may not show up if
the assistant immediately reads the record back. Reads are synchronous and return current
data.

## Other failures

| What you see | What it means |
|--------------|---------------|
| `401`, or the client reporting the server as needing authentication | No token, or the 15-minute access token expired. The client re-runs the OAuth flow; if it does not, authenticate again manually |
| `404`, or a connection failure | The URL is wrong. It must be exactly `https://mcp.hyros.com/mcp` — the `/mcp` path is required |
| A validation error naming a field | The tool rejected an argument. The **REST API** tab documents the accepted values for the equivalent field |

### Permissions and safety

Your assistant acts with your Hyros permissions, and some tools change data. Each tool
declares whether it only reads, and compliant clients use that declaration to decide when to
ask you for confirmation.

A few habits worth keeping:

- **Read the confirmation prompts** for anything that creates, updates or deletes. Reserve any
  "always allow" option for read-only tools.
- **Turn off the write tools wherever you only want reporting.** Most clients let you disable
  individual tools — `/mcp` in Claude Code, the **Search and tools** menu in Claude. The
  connector will still answer questions but cannot change anything.
- **Treat data coming back from Hyros as data, not instructions.** Lead names, tag names and
  page URLs are user-supplied content; text inside them is not a command for your assistant to
  follow.
- **Disconnect connectors you are not using.** Every connected server also takes up room in
  the model's context.

### Data handling and privacy

## What the connector can reach

The access token is bound to the one Hyros account that signed in, and carries the `mcp`
scope only. Through it, the tools can read and write that account's Hyros data — the same
data and the same permissions you have when you sign in to the Hyros app, no more. It reaches
no other Hyros account.

## What the connector receives

Only the arguments of the tool your assistant calls, and only for the call being made. The
server has no access to your conversation history, your assistant's memory, files you have
uploaded, or anything else in the client. It does not request any of those and cannot read
them.

## Credentials and revoking access

You sign in on a Hyros page in your own browser; no Hyros password or API key is entered into
the client, and none is stored in a config file. Your client stores the OAuth tokens it
receives. Access tokens last 15 minutes; refresh tokens, issued only to clients that register
with credentials, last 30 days and are rotated on each use. Disconnecting or removing the
server in your client drops the stored tokens; to change which Hyros account the connector
acts on, disconnect it, sign in to the account you want, and connect again.

If you connect through the `mcp-remote` bridge (see **Other MCP clients**), that
bridge runs the OAuth flow on your machine and caches the resulting tokens in `~/.mcp-auth`
under your user account. Deleting that directory revokes the bridge's stored access locally.

## Policies

Data collection, storage, sharing and retention are governed by the same policies as the rest
of Hyros:

- [Privacy policy](https://hyros.com/privacy.html) — for privacy questions or data requests,
  contact [privacy@hyros.com](mailto:privacy@hyros.com)
- [Terms of service](https://hyros.com/terms-of-service.html)

### Troubleshooting

| Symptom | Cause and fix |
|---------|---------------|
| Tool calls report that MCP is not enabled for the account | The account you logged in with is not authorized to use Hyros MCP. Ask [Hyros support](https://support.hyros.com) to enable it. |
| The server needs authentication right after being added — `! Needs authentication` in Claude Code | Expected. The server was reached and returned an OAuth challenge — trigger your client's connect or authenticate action |
| It needs authentication again later | The stored token expired or was revoked. Authenticate the same way; in Claude Code, `claude mcp logout <name>` then `claude mcp login <name>` clears the stored credentials first |
| `Failed to connect`, or an error mentioning a `404` | Check the URL is exactly `https://mcp.hyros.com/mcp`. The `/mcp` path is required — the bare host will not resolve to the server |
| The browser never opens during sign-in | Use your client's headless option — in Claude Code, `claude mcp login <name> --no-browser`, then open the printed URL yourself and paste the redirect URL back |
| Nothing happens after adding the server to a config file | The entry is in the wrong shape for that client: the wrong wrapper key (`servers` vs `mcpServers` vs `mcp_servers`), the wrong URL field (`url` vs `serverUrl` vs `httpUrl`), or a `type` where the client accepts none — and in Claude Code, a `url` with no `type`. Follow the tutorial for your client under **Connecting**, and your client's own docs for the key and field names. In Claude Code a project-scoped `.mcp.json` entry also waits for approval and folder trust; Claude Desktop's config file cannot hold a remote URL at all; Cursor needs the `mcp-remote` bridge rather than a URL |
| The client asks for an OAuth Client ID and Secret | Leave them empty. The server registers clients dynamically |
| Tools return data for the wrong Hyros account | The token is bound to the account that signed in. Disconnect the connector, sign in to the correct account at [https://app.hyros.com](https://app.hyros.com), then connect again |
| Connected, but no Hyros tools in the conversation | The connector is switched off for that chat, or its tools are disabled. In Claude, check the **`+` → Connectors** and **Search and tools** menus |
| A specific tool is missing | It may be disabled in your client's tool list, or your account may not have access to that feature |
| `hyros_diagnose_tracking` does not appear in the tool list | It is a prompt, not a tool, so it is never listed with the tools. How you start it depends on the client: in Claude Code it is the slash command `/mcp__hyros__hyros_diagnose_tracking`, and in Claude on the web, desktop and mobile the **`+`** button lists it under the connector. See **Prompts**. If your client offers no way to start prompts at all, it does not support them; ask for a tracking diagnosis in your own words and the same tools are used |
| `429`, or a message about reaching the MCP request limit | Rate limited. Wait for `Retry-After` and narrow the request — a shorter date range or fewer pages. See **Rate limits and errors** |
| The client cannot complete OAuth, or offers only an API key field | The server issues no API keys. If the client cannot run the remote OAuth flow itself — Cursor, or any stdio-only host — connect it through the `mcp-remote` bridge in **Other MCP clients** |
| The `mcp-remote` bridge worked once and now fails to authenticate | Its cached token in `~/.mcp-auth` is stale. Delete that directory and start the client again to re-run the OAuth flow |
| `No MCP servers configured` in Claude Code | The server was added at `local` scope from a different project. Re-add it with `--scope user`, or run the command from the original project |

### Support

For help connecting, contact [Hyros support](https://support.hyros.com).

Report suspected security issues to [Hyros support](https://support.hyros.com) as well,
marking the request as a security report so it is escalated rather than handled as a normal
setup question.
