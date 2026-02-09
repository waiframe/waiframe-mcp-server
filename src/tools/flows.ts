import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { WaiframeApiClient } from "../api-client.js";

export function registerFlowTools(server: McpServer, client: WaiframeApiClient) {
  server.tool(
    "get_flow",
    "Get a user flow showing screen navigation sequence with named screens (no UUIDs)",
    {
      projectId: z.string().describe("The project UUID"),
      flowName: z.string().describe("The flow name (use get_project_overview to see names)"),
    },
    async ({ projectId, flowName }) => {
      const flows = await client.getFlows(projectId);
      const target = flows.find(
        (f) => f.name.toLowerCase() === flowName.toLowerCase()
      );

      if (!target) {
        const available = flows.map((f) => f.name).join(", ");
        return {
          content: [
            {
              type: "text",
              text: `Flow "${flowName}" not found. Available flows: ${available || "(none)"}`,
            },
          ],
        };
      }

      const screenNames = target.nodes
        .map((n) => n.screenName || n.screenId)
        .join(" → ");

      const edgeList = target.edges
        .map((e) => {
          const sourceNode = target.nodes.find((n) => n.screenId === e.source);
          const targetNode = target.nodes.find((n) => n.screenId === e.target);
          const sourceName = sourceNode?.screenName || e.source;
          const targetName = targetNode?.screenName || e.target;
          return `  ${sourceName} → ${targetName}${e.label ? ` (${e.label})` : ""}`;
        })
        .join("\n");

      const text = `# Flow: ${target.name}
${target.description || ""}

Entry: ${target.entryScreenName || target.entryScreen}
Sequence: ${screenNames}

## Transitions
${edgeList || "  (no transitions defined)"}`;

      return { content: [{ type: "text", text }] };
    }
  );
}
