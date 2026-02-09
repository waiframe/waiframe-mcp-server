import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { formatDesignPatternsText } from "../data/design-patterns.js";

export function registerDesignPatternsResource(server: McpServer) {
  server.resource(
    "design-patterns",
    "waiframe://design-patterns",
    {
      description:
        "Curated UI design patterns for wireframe layouts (auth, dashboard, list, detail, settings, etc.)",
      mimeType: "text/markdown",
    },
    async () => ({
      contents: [
        {
          uri: "waiframe://design-patterns",
          mimeType: "text/markdown",
          text: formatDesignPatternsText(),
        },
      ],
    })
  );
}
