import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { formatComponentCatalogText } from "../data/component-catalog.js";

export function registerComponentCatalogResource(server: McpServer) {
  server.resource(
    "component-catalog",
    "waiframe://component-catalog",
    {
      description:
        "Complete catalog of all Waiframe wireframe components with their properties and descriptions",
      mimeType: "text/markdown",
    },
    async () => ({
      contents: [
        {
          uri: "waiframe://component-catalog",
          mimeType: "text/markdown",
          text: formatComponentCatalogText(),
        },
      ],
    })
  );
}
