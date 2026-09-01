> ## Documentation Index
> Fetch the complete documentation index at: https://developers.fathom.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Overview

> Connect your meeting data to LLMs using the Model Context Protocol

## How to Connect the Fathom MCP Server

Fathom now offers an official MCP (Model Context Protocol) server, allowing you to connect your Fathom meeting data to AI assistants like ChatGPT, Claude, and more. This guide walks you through setup on each supported platform.

## Choose your assistant

<div
  style={{
display: "grid",
gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
gap: "1rem",
marginTop: "0.5rem",
}}
  className="not-prose"
>
  <a
    href="/mcp-docs/chatgpt"
    style={{
  display: "block",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  borderRadius: "12px",
  padding: "1.25rem",
  textDecoration: "none",
  color: "inherit",
}}
  >
    <img src="https://mintcdn.com/fathom-e4df0608/AEC-X4jFplvaRPpa/images/mcp-openai.svg?fit=max&auto=format&n=AEC-X4jFplvaRPpa&q=85&s=04f58adf9a687318bb186120a128fc96" width="24" height="24" alt="" style={{ display: "block", marginBottom: "0.75rem" }} data-path="images/mcp-openai.svg" />

    <div style={{ fontWeight: 600, fontSize: "1rem", marginBottom: "0.35rem" }}>ChatGPT</div>

    <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.5, opacity: 0.72 }}>
      Connect to the Fathom app in ChatGPT
    </p>
  </a>

  <a
    href="/mcp-docs/claude"
    style={{
  display: "block",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  borderRadius: "12px",
  padding: "1.25rem",
  textDecoration: "none",
  color: "inherit",
}}
  >
    <img src="https://mintcdn.com/fathom-e4df0608/AEC-X4jFplvaRPpa/images/mcp-claude.svg?fit=max&auto=format&n=AEC-X4jFplvaRPpa&q=85&s=d2f891fb486f17463e4b0df958c45507" width="24" height="24" alt="" style={{ display: "block", marginBottom: "0.75rem" }} data-path="images/mcp-claude.svg" />

    <div style={{ fontWeight: 600, fontSize: "1rem", marginBottom: "0.35rem" }}>Claude</div>

    <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.5, opacity: 0.72 }}>
      Connect to the Fathom connector in Claude, or add the MCP in Claude Code
    </p>
  </a>
</div>

## Use with other tools

Connect Fathom to any MCP-compatible tool using the server URL below, then authenticate to access your meeting data.

**MCP server URL:** `https://api.fathom.ai/mcp`
