#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { WaiframeApiClient } from "./api-client.js";
import { registerProjectTools } from "./tools/projects.js";
import { registerScreenTools } from "./tools/screens.js";
import { registerFlowTools } from "./tools/flows.js";
import { registerContextTools } from "./tools/context.js";
import { registerComponentSpecTools } from "./tools/component-spec.js";
import { registerBlueprintTools } from "./tools/blueprint.js";
import { registerComponentCatalogResource } from "./resources/component-catalog.js";
import { registerDesignPatternsResource } from "./resources/design-patterns.js";

const apiKey = process.env.WAIFRAME_API_KEY;
if (!apiKey) {
  console.error("Error: WAIFRAME_API_KEY environment variable is required.");
  console.error("Generate one at: https://waiframe.ai/app/settings?tab=api-keys");
  process.exit(1);
}

const baseUrl = process.env.WAIFRAME_BASE_URL || "https://waiframe.ai";

const client = new WaiframeApiClient(apiKey, baseUrl);

const server = new McpServer({
  name: "waiframe",
  version: "0.1.0",
});

// Register tools
registerProjectTools(server, client);
registerScreenTools(server, client);
registerFlowTools(server, client);
registerContextTools(server, client);
registerComponentSpecTools(server);
registerBlueprintTools(server, client);

// Register resources
registerComponentCatalogResource(server);
registerDesignPatternsResource(server);

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
