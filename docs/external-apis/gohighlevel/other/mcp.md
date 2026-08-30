---
title: "LeadConnector MCP Server"
source: "https://marketplace.gohighlevel.com/docs/other/mcp"
seccion: "MCP Server"
api_version: "v3"
capturado: "2026-08-30"
---

# LeadConnector MCP Server

We’re excited to announce that the LeadConnector MCP (Model Context Protocol) server is **live and ready for use!** It opens up a world where advanced AI assistants can talk directly to your CRM data and tools. Think of it as a bridge: you can now **query, automate, and orchestrate** everything in your LeadConnector account with AI.

**The best way to connect your agents to LeadConnector is the per-client endpoint `https://services.leadconnectorhq.com/mcp/{client}/v2` — live today for Claude at `/mcp/anthropic/v2`, with more clients on the way.**

## What is MCP?

MCP is an open protocol that standardizes how applications provide context to large language models. The LeadConnector MCP server gives AI assistants a standardized way to work with your LeadConnector data and operations — without you or the model needing to know the internal details of how the underlying APIs work.

## Authentication (both endpoints)

Every LeadConnector MCP endpoint supports **both** authentication methods — pick whichever your client prefers. In **both** flows, **you choose exactly which scopes to grant** the integration:

- **OAuth (recommended)** — one-click sign-in through the LeadConnector consent flow (nothing to store or rotate). You **approve the scopes** on the consent screen, and OAuth makes the **widest set of scopes** available.
- **Private Integration Token (PIT)** — create a token under **Settings → Private Integrations**, **selecting the scopes** you want it to have, and pass it in the `Authorization` header. A PIT offers a **more limited set of scopes than OAuth**.

Because OAuth exposes a broader scope set than a PIT, it unlocks more of the operation catalog — another reason it’s the recommended choice. Either way, the integration can only do what the scopes you grant allow.

Every **request** targets a single sub-account (location). The original `/mcp/` endpoint is **one sub-account per connection**. The per-client `/mcp/{client}/v2` endpoint additionally lets an **agency connect once and work across many sub-accounts** — choosing the sub-account per request (see [Working across sub-accounts](#working-across-sub-accounts-agencies)).

## Which endpoint to use

|  | **`/mcp/{client}/v2`** — recommended | **`/mcp/`** — original |
| --- | --- | --- |
| **Endpoint** | `https://services.leadconnectorhq.com/mcp/anthropic/v2` (live) — more clients planned | `https://services.leadconnectorhq.com/mcp/` |
| **Auth** | OAuth **or** Private Integration Token | OAuth **or** Private Integration Token |
| **Clients** | Per-client; **Claude live today**, others [planned](#roadmap) | Any HTTP-based MCP client (Cursor, Windsurf, n8n, custom agents, and more) |
| **Coverage** | **Widest** — the full operation catalog: hundreds of operations across **40 domains** | **Limited** — a focused set of core tools / narrower scope |
| **Level** | Single sub-account, **or** agency-wide across many sub-accounts (one connection) | Single sub-account per connection |

**Recommendation:** use `/mcp/{client}/v2` for the widest coverage. It’s **live today for Claude** at `/mcp/anthropic/v2`. The original `/mcp/` endpoint works with **any** MCP client (via OAuth or PIT) but exposes a more limited toolset.

---

# Recommended: the per-client endpoint (`/mcp/{client}/v2`)

The recommended way to connect your agents. Each client gets a dedicated endpoint following the pattern `https://services.leadconnectorhq.com/mcp/{client}/v2`, backed by the **full LeadConnector operation catalog**.

**Live today:** `https://services.leadconnectorhq.com/mcp/anthropic/v2` (Claude). Other clients are on the [roadmap](#roadmap).

> **▶️ Walkthrough video:** [Watch on Loom](https://www.loom.com/share/b23bfe32e8be42838bd6eab12a0b932f)

- **Widest coverage** — the full operation catalog (hundreds of operations across 40 domains), well beyond the original `/mcp/` toolset. The exact operations an assistant sees are filtered by your grant.
- **OAuth or PIT** — connect with one-click OAuth (recommended) or a Private Integration Token in the `Authorization` header.
- **One sub-account, or your whole agency** — connect to a **single sub-account** (the default), or, as an **agency**, connect **once and work across many sub-accounts** from the same connection. Every request still runs against one sub-account you choose — see [Working across sub-accounts](#working-across-sub-accounts-agencies).
- **A small, stable toolset** — instead of hundreds of individual tools competing for the model’s attention, the server exposes a compact set of unified tools (below). The assistant uses them to discover and run everything else.

> **Single sub-account:** with OAuth, your client opens a browser to the LeadConnector sign-in page — sign in, choose the sub-account (location) to expose, and approve. The connection then operates on that location for its lifetime. **Agency, many sub-accounts:** installing as an agency, you choose **which** sub-accounts to include. The one connection can then work across all of them — the assistant uses the sub-account you name, or asks which one when it’s ambiguous, and you can switch between them in the same chat. It only ever touches the sub-accounts you selected.

## A small, unified toolset

Rather than listing every operation as its own tool, the server presents a handful of unified tools. There are only a few to learn — the assistant handles the rest.

| Tool | What it does |
| --- | --- |
| `search` | Find customer or business records by name, email, phone, tag, or similar criteria |
| `fetch` | Retrieve the full details of one or more records returned by `search` |
| `search_operations` | Discover the available operations by intent — list, create, update, delete, and more |
| `describe_operation` | Inspect an operation’s inputs before running it |
| `execute_operation` | Run one operation, subject to your scopes and built-in safety checks |
| `list_locations` | List the sub-accounts this connection can use, so you can pick one (agency connections) |

Behind these sits the full LeadConnector operation catalog — **hundreds of operations across 40 domains**. Use `search_operations` at any time to see what’s available to your grant.

## A single prompt in action

Once connected, you don’t need to know the LeadConnector API — you just ask. For example:

> _“Find the contact with email [[email protected]](https://marketplace.gohighlevel.com/cdn-cgi/l/email-protection#88e2e9e6edc8edf0e9e5f8e4eda6ebe7e5), add the tag ‘vip-2026’, and create a new opportunity in the ‘Sales Pipeline’ for them worth $5,000.”_

Behind the scenes the assistant:

1. `search` → finds Jane’s contact

2. `search_operations` → discovers the “add tags” and “create opportunity” operations

3. `describe_operation` → inspects the inputs each operation expects

4. `execute_operation` → adds the tag and creates the opportunity

You get a single, natural-language confirmation back.

## Working across sub-accounts (agencies)

> **▶️ Walkthrough video:** [Multiple sub-account support in Claude.ai — watch on Loom](https://www.loom.com/share/c42958a4af2e4b61a67992b07263001d)

Individual users connect to one sub-account and never think about locations again. **Agencies** can instead connect **once** and work across **many** sub-accounts from the same connection — no separate connection per sub-account.

**How it works:**

1. **Install for your agency.** When you connect, choose **which** sub-accounts to include (one, several, or all). The connection can work with exactly those — and no others.

2. **Name the sub-account, or let the assistant ask.** In a request, refer to the sub-account by name (e.g. _“in Downtown Clinic, …”_). If you don’t say which one and it’s ambiguous, the assistant calls `list_locations` and asks you to choose.

3. **Switch freely in the same chat.** Ask about one sub-account, then another, without reconnecting — _“now do the same for the Uptown location.”_

**Example:**

> _“List the contacts tagged ‘vip-2026’ in Downtown Clinic, then compare the count with Uptown Med Spa.”_

The assistant uses `list_locations` to resolve the names, runs the query against each sub-account, and reports both — each request authorized against your installation.

> **One sub-account at a time, always authorized.** Each request runs against a single sub-account you chose at install. A request for a sub-account you didn’t include (or that isn’t part of the installation) is refused — the connection can never reach beyond the sub-accounts you selected.

> **Availability:** individual single-sub-account connections work today. Agency-wide connections across multiple sub-accounts are **rolling out** — an agency enables them by installing with the multi-sub-account (bulk) option. If your install offers only a single sub-account, that option isn’t enabled for your app yet.

## What you can do

Coverage spans your whole LeadConnector account, including:

- **Contacts** — get, list, search, create, update, delete, upsert, duplicate lookup, tags, notes, tasks, followers, appointments, and business assignment
- **Conversations & Messages** — create, get, update, delete, and search conversations; read and send messages; message status
- **Opportunities & Pipelines** — pipelines, lost reasons, search, create, update, delete, upsert, followers, and status changes
- **Calendars & Appointments** — calendars, groups, appointments, events, notes, notifications, free/blocked slots, resources, schedules, services, and service bookings
- **Payments** — coupons, integrations, orders, order fulfillment, subscriptions, and transactions
- **Products & Store** — products, prices, collections, inventory, reviews, shipping carriers/zones/rates, and store settings
- **Invoices & Estimates** — invoices, estimates, templates, schedules, and send/void actions
- **Social Planner** — accounts, posts, categories, tags, calendar views, and statistics
- **Blogs** — blog sites, authors, categories, posts, and slug checks
- **Emails** — templates, template folders, campaigns, scheduling, and campaign stats
- **Forms & Surveys** — forms, surveys, and their submissions

…and more. Ask `search_operations` for the exact operations available to your grant.

## Connect Claude (`/mcp/anthropic/v2`)

Claude connects to `https://services.leadconnectorhq.com/mcp/anthropic/v2`. One-click OAuth is recommended; a Private Integration Token also works.

### Claude.ai

1. Open **Claude.ai** → **Settings** → **Connectors** → **Add custom connector**.

2. Set the server URL to `https://services.leadconnectorhq.com/mcp/anthropic/v2`.

3. Click **Connect** and complete the LeadConnector sign-in (sign in → pick sub-account(s) → approve).

4. Start a new chat — the LeadConnector tools are now available.

> **Tip:** Ask _“Find the last 5 contacts I added in LeadConnector”_ to confirm the connection works.

### Claude Code (CLI)

```bash
claude mcp add --transport http leadconnector https://services.leadconnectorhq.com/mcp/anthropic/v2
```

Or add it to `.mcp.json` at your project root:

```json
{
  "mcpServers": {
    "leadconnector": {
      "type": "http",
      "url": "https://services.leadconnectorhq.com/mcp/anthropic/v2"
    }
  }
}
```

On first use, Claude Code opens a browser for LeadConnector authorization. Verify with `claude mcp list`.

### Claude Cowork

1. In **Claude Cowork**, open the **connectors / integrations** settings and choose **Add custom connector**.

2. Set the server URL to `https://services.leadconnectorhq.com/mcp/anthropic/v2`.

3. Complete the LeadConnector sign-in (sign in → pick sub-account(s) → approve).

4. Your Cowork agents can now use the LeadConnector tools.

> **Prefer a token?** Instead of OAuth, you can pass a Private Integration Token in the `Authorization` header (`Bearer pit-your-token`) — see the [PIT setup](#authentication-both-endpoints) note above.

## Permissions & security

- **You choose the sub-accounts.** At connect time you select which sub-account(s) the connection can operate on — a single one, or (for agencies) several. It never reaches a sub-account you didn’t include, and every request is authorized against your installation before it runs.
- **Scoped to your grant.** The assistant can only perform operations your OAuth scopes (or PIT scopes) allow. With OAuth you can review or revoke access at any time from your LeadConnector account.
- **Safety checks.** Sensitive and irreversible operations are gated with additional confirmation and safety checks before they run.

---

# Also available: the original endpoint (`/mcp/`)

**Endpoint:** `https://services.leadconnectorhq.com/mcp/`

> **▶️ Walkthrough video:** [Watch on Loom](https://www.loom.com/share/d6b2228911514b5a9bbf88fd74a84759)

The original LeadConnector MCP endpoint. It works with **any HTTP-based MCP client** (Cursor, Windsurf, n8n, or your own agent), supports **both OAuth and Private Integration Token** auth, and is a **sub-account (location) level** feature. It exposes a **more limited, focused set of core tools** (contacts, conversations, opportunities, calendars, payments, social planner, blogs, emails) with a narrower scope than the `/mcp/{client}/v2` catalog.

> For the widest coverage, use the [recommended per-client endpoint](#recommended-the-per-client-endpoint-mcpclientv2) above.

**Connect with OAuth:** point your MCP client at `https://services.leadconnectorhq.com/mcp/` and complete the sign-in when prompted.

**Connect with a Private Integration Token:** create a token under **Settings → Private Integrations** (selecting the scopes your AI needs), then add the endpoint and headers to your client. The `locationId` header is optional — it can also be provided in prompts.

```json
{
  "mcpServers": {
    "leadconnector-mcp": {
      "url": "https://services.leadconnectorhq.com/mcp/",
      "headers": {
        "Authorization": "Bearer pit-your-token",
        "locationId": "your-location-id"
      }
    }
  }
}
```

---

## Roadmap

The recommended per-client OAuth experience is delivered per client, each with its own endpoint following the pattern:

`https://services.leadconnectorhq.com/mcp/{client}/v2`

- **Available now — `/mcp/anthropic/v2`** (Claude: Claude.ai, Claude Code, Claude Cowork).
- **Planned & coming soon** — a dedicated `/mcp/{client}/v2` endpoint for:
  - **OpenAI (ChatGPT & Codex)**
  - **Cursor**
  - **Windsurf**
  - **VS Code**
  - …and more.

Until a client’s dedicated endpoint ships, it can connect today via the original [`/mcp/` endpoint](#also-available-the-original-endpoint-mcp) (OAuth or PIT). Check back here as each becomes available.

## Try it out & feedback

- Please try out the MCP server and let us know what you think — we value your feedback!
- Connect Claude, or build your own agent on either endpoint.
- For questions or support, feel free to reach out.
