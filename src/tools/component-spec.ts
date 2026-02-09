import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getComponentByType, COMPONENT_CATALOG } from "../data/component-catalog.js";

export function registerComponentSpecTools(server: McpServer) {
  server.tool(
    "get_component_spec",
    "Get the specification for a Waiframe wireframe component (props, description, category)",
    {
      componentType: z
        .string()
        .describe("The component type (e.g. 'button-primary', 'text-input', 'sidebar')"),
    },
    async ({ componentType }) => {
      const component = getComponentByType(componentType);

      if (!component) {
        const types = COMPONENT_CATALOG.map((c) => c.type).join(", ");
        return {
          content: [
            {
              type: "text",
              text: `Component "${componentType}" not found.\n\nAvailable types: ${types}`,
            },
          ],
        };
      }

      const propsStr = Object.entries(component.props)
        .map(([k, v]) => `  - ${k}: ${v}`)
        .join("\n");

      const text = `# Component: ${component.type}
Category: ${component.category}
${component.description}

## Properties
${propsStr}`;

      return { content: [{ type: "text", text }] };
    }
  );
}
