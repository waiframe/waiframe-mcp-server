# Waiframe MCP Server

Connect AI coding tools to your [Waiframe.ai](https://waiframe.ai) wireframe designs using the [Model Context Protocol](https://modelcontextprotocol.io).

Build UI code that matches your wireframes — your AI coding tool gets structured context about screens, components, navigation flows, and design patterns.

## Quick Start

### 1. Get an API Key

Go to [waiframe.ai/app/settings?tab=api-keys](https://waiframe.ai/app/settings?tab=api-keys) and create an API key.

### 2. Configure Your AI Tool

**Claude Code** — add to your MCP settings:

```json
{
  "mcpServers": {
    "waiframe": {
      "command": "npx",
      "args": ["-y", "@waiframe/mcp-server"],
      "env": {
        "WAIFRAME_API_KEY": "wf_sk_your_key_here"
      }
    }
  }
}
```

**Cursor** — add the same config to your MCP settings file.

### 3. Use It

Once connected, your AI tool can:

- **List your projects** — see all wireframe projects
- **Read screens** — get component layouts in a semantic format (no UUIDs or pixel positions)
- **Follow flows** — understand navigation between screens
- **Get design context** — app type, audience, features, brand style
- **Look up components** — specs for any of the 60+ wireframe component types

## Tools

| Tool | Description |
|------|-------------|
| `list_projects` | List all your wireframe projects |
| `get_project_overview` | Project details with screen and flow names |
| `get_screen` | Semantic wireframe layout for a screen |
| `get_flow` | Navigation flow between screens |
| `get_design_context` | App context (type, audience, features) |
| `get_component_spec` | Component specification and properties |

## Resources

| Resource | Description |
|----------|-------------|
| `waiframe://component-catalog` | Full catalog of 60+ wireframe components |
| `waiframe://design-patterns` | 20 curated UI design patterns |

## How It Works

```
AI Coding Tool ←stdio→ @waiframe/mcp-server ←HTTPS→ waiframe.ai API
```

The MCP server runs locally on your machine. It connects to the Waiframe API using your API key and translates wireframe data into an AI-friendly format:

- **Strips** UUIDs, pixel positions, and sizes
- **Keeps** component types, properties, labels, and text
- **Resolves** navigation connections to screen names
- **Sorts** elements top-to-bottom for reading order

### Example

A button in your wireframe becomes:

```
- button-primary {label: "Sign In"} → Dashboard
```

Instead of raw JSON with UUIDs and coordinates.

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `WAIFRAME_API_KEY` | Yes | — | Your API key from waiframe.ai |
| `WAIFRAME_BASE_URL` | No | `https://waiframe.ai` | API base URL (for development) |

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run locally
WAIFRAME_API_KEY=wf_sk_... node dist/index.js
```

## License

MIT
