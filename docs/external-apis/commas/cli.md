---
title: "Connect to CLI"
source: "https://commasdocs.com/#cli"
seccion: "Herramientas y referencia"
ancla: "#cli"
capturado: "2026-08-30"
---

CLI

# Connect to CLI

Your entire Commas business, one terminal away. The **Commas CLI** gives you — and your AI agents — full command-line access to products, payments, customers, subscriptions, discount codes, and webhooks. Everything the API can do, in single typed commands.

◆ What can the CLI do?

Issue a refund, spin up a payment link, create a discount code, cancel a subscription, look up a customer — each one is a single command like `commas tx refund pX9vQ`. No dashboard clicks, no API boilerplate.

⚡ One-Line Operations

Refunds, payment links, discounts, subscription changes — one command each, instant results.

🤖 Built for AI Agents

`--json`

output and

`--yes`

confirmation flags let Claude Code, Cursor, or any terminal agent operate your account.

🔒 Safe by Default

Refunds, charges, cancellations and deletes show you a summary and ask for confirmation before anything executes —

`subs extend`

is the exception and runs immediately.

🔑 Your Data Only

Scoped to your API key — you only ever see your own account. Sandbox mode included for risk-free testing.

── SETUP GUIDE ───────────────────────────────────────────

### Setup Guide

From zero to your first command in about two minutes.

**1. Install Node.js 20 or newer.** The CLI runs on Node — grab it from [nodejs.org](https://nodejs.org) if you don't have it. Already installed? Check with:

```
node --version   # should print v20 or higher
```

**2. Install the Commas CLI.**

```bash
npm install -g commas-cli
```

**3. Log in with your API key.** Find it in your Commas dashboard — the same key the AI Agent connector uses. Your key is stored locally on your machine and only ever sent to Commas to authenticate.

```
commas login
Commas API key: ********
Logged in — 38 tools available.
```

**4. Verify the connection.**

```
commas status
Reachable:   yes (v1.0.0)
Environment: production
API key:     comm…a4f9
```

💡 Test drive in sandbox first

Sandbox needs its own API key registered against your account. Check what you have with `commas keys list`, add one with `commas keys add sandbox`, then run `commas env sandbox` — every command now goes to the QA environment, so you can create test payment links and issue fake refunds safely. Switch back with `commas env production`.

If you ask for sandbox without a sandbox key, the command **stops and tells you** — it never quietly falls back to production.

── USING THE CLI ─────────────────────────────────────────

### Using the CLI

A few everyday flows. Every command supports `--help` for full options.

**See your products and recent payments:**

```
commas products list
commas tx list --per-page 20
commas customers search "jane@example.com"
```

**Create a payment link:**

```
commas checkout create --title "1:1 Coaching Call" --type onetime_reusable --amount 499
```

Returns a `payment_link` you can share immediately.

**Issue a refund** — the CLI shows you exactly what will happen and asks first:

```
commas tx refund pX9vQ --amount 25.00 --reason "Customer request"
Refund $25.00 from transaction pX9vQ.
Proceed? (y/N) y
```

**Launch a discount code:**

```
commas discounts create --code LAUNCH20 --type percentage --value 20 --duration once --products 1234 --max-uses 100
```

⚠ Confirmations on destructive commands

Refunds, charges, cancellations, and deletions always show a summary and ask `Proceed? (y/N)` before executing. Pass `--yes` to skip the prompt — required for scripts and AI agents, so use it deliberately. Two exceptions run immediately with no prompt: `commas subs extend` and `commas keys add` — the server never asks for confirmation on those, so treat them as final.

── COMMAND REFERENCE ─────────────────────────────────────

### Command Reference

Every command also accepts `--json` for machine-readable output and `--env sandbox` for a one-off sandbox run.

| Command | What it does |
| --- | --- |
| `commas login` / `logout` | Save or remove your API key |
| `commas status` | Server health and current configuration |
| `commas env [production\|sandbox]` | Show or switch the default environment |
| `commas keys list` | Which environments have an API key registered |
| `commas keys add production\|sandbox` | Register the API key an environment needs (prompts without echo) |
| `commas products list` | List your products |
| `commas products create` | Create a product directly → `product_id` + shareable `payment_link` |
| `commas products transactions <id>` | Per-product transaction history (numeric id or hashid) |
| `commas customers search "<query>"` | Find customers by name or email |
| `commas customers payment-methods <id>` | A customer's saved payment methods |
| `commas customers charge <id>` | Charge a saved payment method (confirms first) |
| `commas tx list` / `get <id>` | List transactions or inspect one |
| `commas tx session <id>` | Transactions for a checkout session |
| `commas tx refund <id>` | Full or partial refund (confirms first) |
| `commas subs list` | All subscribers with billing status |
| `commas subs product <id>` / `session <id>` | Subscriptions for a product or session |
| `commas subs cancel <id> --session <id>` | Cancel a subscription (confirms first) |
| `commas subs extend` | Extend a subscription by N days (runs immediately — no confirmation) |
| `commas subs upgrades <id>` | Upgrade tiers available for a subscription, proration pre-calculated |
| `commas subs upgrade-preview <id> --to <svc>` | Exact prorated charge for an upgrade — read-only |
| `commas subs upgrade <id> --to <svc>` | Execute the upgrade — charges prorated amount (confirms first) |
| `commas subs link-create` | Subscription payment link with courses, Discord roles, bumps & upsells attached |
| `commas subs link-preview` | Preview a subscription link without creating it |
| `commas checkout create` | New checkout session → shareable payment link |
| `commas checkout get` / `delete <id>` | Inspect or delete a checkout session |
| `commas checkout update-embedded` | Update an embedded session (payment methods / metadata) |
| `commas checkout embedded` | Embedded checkout session for iframe forms (needs `--creator` and `--product`) |
| `commas discounts list\|get\|create\|update\|delete` | Manage discount codes end-to-end. Creating one needs `--type`, `--value`, `--duration` and `--products`. |
| `commas webhooks list\|create\|delete\|test` | Manage webhook subscriptions, send test events |
| `commas docs <question>` | Search these API docs from the terminal |
| `commas tools` | List every capability the server exposes |
| `commas call <tool>` | Call any tool directly — the escape hatch |

── CLI + AI AGENTS ───────────────────────────────────────

### CLI + AI Agents

The CLI is how **terminal-based AI agents** run your business. Claude Code, Cursor, Codex — any agent that can run shell commands can operate your Commas account with zero extra setup: install the CLI, run `commas login` once, and the agent takes it from there.

```
commas tx list --json          # structured output the agent can parse
commas tx refund pX9vQ --yes # non-interactive confirmation
```

Once it's installed, try prompts like these with your agent:

📊 Revenue Report

"Use the commas CLI to pull this week's transactions and summarize revenue by product"

🔗 Instant Offer

"Create a $499 payment link for my new coaching offer and give me the URL"

🏷️ Launch Campaign

"Set up a 20% launch discount limited to the first 100 buyers"

📋 Subscriber Export

"Export all my active subscribers to a CSV"

◆ CLI or AI Agent connector?

Both talk to the same Commas backend with the same permissions. The [AI Agent connector](#ai-agent) is for chat assistants — Claude, ChatGPT, Grok. The CLI is for terminals, scripts, CI, and coding agents. Use whichever fits the moment — or both.
