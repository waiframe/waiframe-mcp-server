import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { WaiframeApiClient } from "../api-client.js";
import { transformScreen, buildScreenNameMap } from "../transform/semantic.js";

export function registerScreenTools(server: McpServer, client: WaiframeApiClient) {
  server.tool(
    "get_screen",
    "Get a wireframe screen in semantic format (AI-friendly: component types, props, navigation targets — no UUIDs or positions)",
    {
      projectId: z.string().describe("The project UUID"),
      screenName: z.string().describe("The screen name (use get_project_overview to see names)"),
    },
    async ({ projectId, screenName }) => {
      // Fetch all screens to build name map for connection resolution
      const screens = await client.getScreens(projectId);
      const target = screens.find(
        (s) => s.name.toLowerCase() === screenName.toLowerCase()
      );

      if (!target) {
        const available = screens.map((s) => s.name).join(", ");
        return {
          content: [
            {
              type: "text",
              text: `Screen "${screenName}" not found. Available screens: ${available}`,
            },
          ],
        };
      }

      const screenNameMap = buildScreenNameMap(screens);
      const semantic = transformScreen(target, screenNameMap);

      const elementsYaml = formatSemanticElements(semantic.elements, 0);

      const text = `# Screen: ${semantic.name}
Type: ${semantic.type}

## Elements (top to bottom)
${elementsYaml}`;

      return { content: [{ type: "text", text }] };
    }
  );
}

function formatSemanticElements(
  elements: Array<{
    component: string;
    props: Record<string, unknown>;
    navigates_to?: string;
    children?: Array<{ component: string; props: Record<string, unknown>; navigates_to?: string; children?: unknown[] }>;
  }>,
  indent: number
): string {
  const prefix = "  ".repeat(indent);
  return elements
    .map((el) => {
      const propsStr = Object.entries(el.props)
        .filter(([, v]) => v !== undefined && v !== null && v !== "")
        .map(([k, v]) => {
          if (Array.isArray(v)) return `${k}: [${v.map((i) => `"${i}"`).join(", ")}]`;
          if (typeof v === "string") return `${k}: "${v}"`;
          return `${k}: ${v}`;
        })
        .join(", ");

      let line = `${prefix}- ${el.component}`;
      if (propsStr) line += ` {${propsStr}}`;
      if (el.navigates_to) line += ` → ${el.navigates_to}`;

      if (el.children && el.children.length > 0) {
        line += "\n" + formatSemanticElements(el.children as typeof elements, indent + 1);
      }

      return line;
    })
    .join("\n");
}
