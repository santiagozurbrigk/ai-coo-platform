> ## Documentation Index
> Fetch the complete documentation index at: https://developers.fathom.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude

> Connect Fathom to Claude with the official connector, or via Claude Code

<h2 id="claude-connector">Claude (web & desktop)</h2>

Fathom is available as an **official connector** in Claude:

### Steps:

1. Go to the **[Fathom connector for Claude](https://claude.ai/directory/connectors/fathom)**.

<Note>
  If you're using Claude in a team or organization, an owner must first enable the connector before it will appear for members.
</Note>

2. Click **Connect** and complete the authorization prompts.

That's it! You can now ask Claude about your meetings.

<h2 id="claude-code">Claude Code</h2>

Claude Code supports adding MCP servers directly from the command line.

Run the following command in your terminal:

```bash theme={null}
claude mcp add fathom -- npx mcp-remote@latest https://api.fathom.ai/mcp
```

The Fathom MCP server will now be available in your Claude Code sessions.
