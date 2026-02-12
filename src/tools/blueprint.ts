import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { WaiframeApiClient } from "../api-client.js";
import type { Platform } from "../types.js";
import { detectFeatures } from "../blueprint/detect-features.js";
import { selectStack } from "../blueprint/stack-selector.js";
import { generateRoutes } from "../blueprint/route-mapper.js";
import { formatBlueprint } from "../blueprint/format-blueprint.js";

export function registerBlueprintTools(
  server: McpServer,
  client: WaiframeApiClient
) {
  server.tool(
    "get_project_blueprint",
    "Analyze a wireframe project and generate a complete application blueprint — tech stack, packages, project structure, routes, and setup commands for scaffolding a real application from wireframes",
    {
      projectId: z
        .string()
        .describe("The project UUID (use list_projects to find it)"),
    },
    async ({ projectId }) => {
      // Fetch all project data in parallel
      const [contextData, screens, flows] = await Promise.all([
        client.getContext(projectId),
        client.getScreens(projectId),
        client.getFlows(projectId),
      ]);

      if (screens.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Project "${contextData.project.name}" has no screens yet. Add screens in the Waiframe editor first, then run this tool again.`,
            },
          ],
        };
      }

      const platform = contextData.project.platform as Platform;

      // 1. Detect features from screen components
      const features = detectFeatures(screens);

      // 2. Select tech stack and resolve packages
      const stack = selectStack(platform, features);

      // 3. Generate route mappings and navigation structure
      const { routes, navigation } = generateRoutes(screens, flows, platform);

      // 4. Format into the final blueprint
      const blueprint = formatBlueprint(
        {
          projectName: contextData.project.name,
          description: contextData.project.description || "",
          platform,
          framework: stack.framework,
          language: stack.language,
          styling: stack.styling,
          detectedFeatures: features,
          packages: stack.packages,
          routes,
          navigation,
          directoryStructure: "",
          envVars: [],
          setupCommands: [],
          configNotes: [],
        },
        contextData.context
      );

      return { content: [{ type: "text" as const, text: blueprint }] };
    }
  );
}
