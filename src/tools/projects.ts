import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { WaiframeApiClient } from "../api-client.js";

export function registerProjectTools(server: McpServer, client: WaiframeApiClient) {
  server.tool(
    "list_projects",
    "List all your Waiframe wireframe projects with screen and flow counts",
    {},
    async () => {
      const projects = await client.listProjects();

      if (projects.length === 0) {
        return {
          content: [{ type: "text", text: "No wireframe projects found. Create one at waiframe.ai" }],
        };
      }

      const text = projects
        .map(
          (p) =>
            `- ${p.name} (${p.platform}): ${p.screenCount} screens, ${p.flowCount} flows [id: ${p.id}]`
        )
        .join("\n");

      return {
        content: [{ type: "text", text: `# Your Wireframe Projects\n\n${text}` }],
      };
    }
  );

  server.tool(
    "get_project_overview",
    "Get a wireframe project overview including all screen names and flow names",
    { projectId: z.string().describe("The project UUID") },
    async ({ projectId }) => {
      const detail = await client.getProjectOverview(projectId);

      const screenList = detail.screens
        .map((s) => `  - ${s.name} (${s.screenType}) [id: ${s.id}]`)
        .join("\n");

      const flowList = detail.flows.length > 0
        ? detail.flows.map((f) => `  - ${f.name}${f.description ? `: ${f.description}` : ""} [id: ${f.id}]`).join("\n")
        : "  (no flows defined)";

      const contextStr = detail.project.aiContext
        ? `\n## App Context\n- Type: ${detail.project.aiContext.appType || "N/A"}\n- Audience: ${detail.project.aiContext.audience || "N/A"}\n- Style: ${detail.project.aiContext.brandStyle || "N/A"}\n- Features: ${detail.project.aiContext.features?.join(", ") || "N/A"}`
        : "";

      const text = `# ${detail.project.name}
${detail.project.description || ""}

Platform: ${detail.project.platform} (${detail.project.dimensions.width}x${detail.project.dimensions.height})

## Screens (${detail.screens.length})
${screenList}

## Flows (${detail.flows.length})
${flowList}${contextStr}`;

      return { content: [{ type: "text", text }] };
    }
  );
}
