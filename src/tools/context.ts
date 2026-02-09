import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { WaiframeApiClient } from "../api-client.js";

export function registerContextTools(server: McpServer, client: WaiframeApiClient) {
  server.tool(
    "get_design_context",
    "Get the app context and design intent for a project (app type, audience, features, brand style)",
    { projectId: z.string().describe("The project UUID") },
    async ({ projectId }) => {
      const data = await client.getContext(projectId);

      if (!data.context) {
        return {
          content: [
            {
              type: "text",
              text: `# ${data.project.name}\n\nPlatform: ${data.project.platform} (${data.project.dimensions.width}x${data.project.dimensions.height})\n${data.project.description || ""}\n\nNo additional design context has been set for this project.`,
            },
          ],
        };
      }

      const ctx = data.context;
      const lines = [
        `# Design Context: ${data.project.name}`,
        "",
        `Platform: ${data.project.platform} (${data.project.dimensions.width}x${data.project.dimensions.height})`,
        data.project.description ? `Description: ${data.project.description}` : "",
        "",
        "## App Details",
        ctx.appType ? `- App Type: ${ctx.appType}` : "",
        ctx.targetAudience ? `- Target Audience: ${ctx.targetAudience}` : "",
        ctx.brandStyle ? `- Brand Style: ${ctx.brandStyle}` : "",
        ctx.keyFeatures && ctx.keyFeatures.length > 0
          ? `- Key Features: ${ctx.keyFeatures.join(", ")}`
          : "",
        ctx.constraints ? `- Constraints: ${ctx.constraints}` : "",
      ].filter(Boolean);

      return { content: [{ type: "text", text: lines.join("\n") }] };
    }
  );
}
