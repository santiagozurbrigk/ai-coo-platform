---
title: "Agents"
source: "https://marketplace.gohighlevel.com/docs/ghl/agent-studio/agents"
seccion: "AI Agent Studio > Agents"
api_version: "v3"
capturado: "2026-08-30"
---

# Agents

Documentation for Agent Studio APIs

- [Create Agent](https://marketplace.gohighlevel.com/docs/ghl/agent-studio/create-agent) — Creates a new agent with staging version. The agent will be created with an initial staging version that can later be promoted to production.
- [List Agents](https://marketplace.gohighlevel.com/docs/ghl/agent-studio/get-agents) — Lists all active agents for the specified location. locationId is required parameter to ensure optimal performance. Supports pagination using limit and offset. Optionally filter by isPublished=true to return only agents with a published production version.
- [Update Agent](https://marketplace.gohighlevel.com/docs/ghl/agent-studio/update-agent-version) — Updates a specific agent version by versionId. Supports updating nodes, edges, variables, and configuration.
- [Update Agent Metadata](https://marketplace.gohighlevel.com/docs/ghl/agent-studio/update-agent-metadata) — Updates agent metadata such as name, description, and status.
- [Delete Agent](https://marketplace.gohighlevel.com/docs/ghl/agent-studio/delete-agent) — Deletes an agent and all its versions.
- [Get Agent](https://marketplace.gohighlevel.com/docs/ghl/agent-studio/get-agent-by-id) — Gets a specific agent by its ID for the specified location with all its versions. Returns complete agent metadata and all non-deleted versions (draft, staging, production). locationId is required parameter. The agent must have active status.
- [Promote to Production](https://marketplace.gohighlevel.com/docs/ghl/agent-studio/promote-and-publish) — Promotes a draft version to production.
- [Execute Agent](https://marketplace.gohighlevel.com/docs/ghl/agent-studio/execute-agent) — Executes the specified agent and returns a non-streaming JSON response with the complete agent output. The agent must be in active status and belong to the specified location. locationId is required in the request body.
- [List Agents (Deprecated)](https://marketplace.gohighlevel.com/docs/ghl/agent-studio/get-agents-deprecated) — **Deprecated endpoint - use GET /agent instead.**
- [Get Agent (Deprecated)](https://marketplace.gohighlevel.com/docs/ghl/agent-studio/get-agent-by-id-deprecated) — **Deprecated endpoint - use GET /agent/:agentId instead.**
- [Execute Agent (Deprecated)](https://marketplace.gohighlevel.com/docs/ghl/agent-studio/execute-agent-deprecated) — **Deprecated endpoint - use POST /agent/:agentId/execute instead.**
