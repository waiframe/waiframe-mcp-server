import type { ProjectContext } from "../types.js";
import type {
  ProjectBlueprint,
  DetectedFeature,
  PackageRecommendation,
  RouteMapping,
  NavigationStructure,
} from "./types.js";

const AUTH_KEYWORDS = ["login", "signin", "sign-in", "signup", "sign-up", "register", "auth"];

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/** Determine if a screen is an auth screen based on its name and components */
function isAuthScreen(route: RouteMapping): boolean {
  const lower = route.screenName.toLowerCase();
  return (
    AUTH_KEYWORDS.some((kw) => lower.includes(kw)) ||
    (route.keyComponentTypes.includes("email-input") &&
      route.keyComponentTypes.includes("password-input"))
  );
}

/** Build env vars list based on detected features */
function buildEnvVars(
  features: DetectedFeature[],
  isMobile: boolean
): string[] {
  const vars: string[] = [];
  const featureIds = new Set(features.map((f) => f.id));

  if (featureIds.has("auth")) {
    if (isMobile) {
      vars.push("SUPABASE_URL=your-project-url");
      vars.push("SUPABASE_ANON_KEY=your-anon-key");
    } else {
      vars.push("NEXT_PUBLIC_SUPABASE_URL=your-project-url");
      vars.push("NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key");
    }
  }

  if (featureIds.has("commerce")) {
    if (isMobile) {
      vars.push("STRIPE_PUBLISHABLE_KEY=your-stripe-key");
    } else {
      vars.push("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-key");
      vars.push("STRIPE_SECRET_KEY=your-stripe-secret");
    }
  }

  if (featureIds.has("maps")) {
    if (isMobile) {
      vars.push("GOOGLE_MAPS_API_KEY=your-maps-key");
    } else {
      vars.push("NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token");
    }
  }

  return vars;
}

/** Build setup commands for the project */
function buildSetupCommands(
  blueprint: ProjectBlueprint,
  isMobile: boolean
): string[] {
  const projectSlug = slugify(blueprint.projectName) || "my-app";
  const commands: string[] = [];

  if (isMobile) {
    commands.push(`flutter create ${projectSlug.replace(/-/g, "_")}`);
    commands.push(`cd ${projectSlug.replace(/-/g, "_")}`);
    const pkgs = blueprint.packages.map((p) => p.name).join(" ");
    if (pkgs) commands.push(`flutter pub add ${pkgs}`);
  } else {
    commands.push(
      `npx create-next-app@latest ${projectSlug} --typescript --tailwind --app --src-dir --use-pnpm`
    );
    commands.push(`cd ${projectSlug}`);
    const deps = blueprint.packages
      .filter((p) => !["next", "react", "react-dom", "tailwindcss"].includes(p.name))
      .map((p) => p.name);
    if (deps.length > 0) {
      commands.push(`pnpm add ${deps.join(" ")}`);
    }
    // Dev deps
    const devDeps = ["@types/node", "@types/react"];
    const featureIds = new Set(blueprint.detectedFeatures.map((f) => f.id));
    if (featureIds.has("maps")) devDeps.push("@types/leaflet");
    commands.push(`pnpm add -D ${devDeps.join(" ")}`);
  }

  return commands;
}

/** Build configuration notes based on detected features */
function buildConfigNotes(
  features: DetectedFeature[],
  isMobile: boolean
): string[] {
  const notes: string[] = [];
  const featureIds = new Set(features.map((f) => f.id));

  if (featureIds.has("auth")) {
    notes.push(
      "Create a Supabase project at supabase.com and add credentials to your env file"
    );
    notes.push(
      "Enable email/password auth in Supabase Dashboard > Authentication > Providers"
    );
  }

  if (featureIds.has("oauth")) {
    notes.push(
      "Configure OAuth providers (Google, Apple, etc.) in Supabase Dashboard > Authentication > Providers"
    );
  }

  if (featureIds.has("commerce")) {
    notes.push(
      "Create a Stripe account and add API keys to your env file"
    );
    if (!isMobile) {
      notes.push(
        "Set up Stripe webhook endpoint at /api/stripe/webhook for payment events"
      );
    }
  }

  if (featureIds.has("maps")) {
    if (isMobile) {
      notes.push(
        "Enable Maps SDK in Google Cloud Console and add API key to AndroidManifest.xml and Info.plist"
      );
    } else {
      notes.push(
        "Create a Mapbox account and add access token to env file"
      );
    }
  }

  if (featureIds.has("file-upload") && featureIds.has("auth")) {
    notes.push(
      "Enable Supabase Storage and create a bucket for file uploads"
    );
  }

  return notes;
}

/** Build a directory structure tree string for web (Next.js) */
function buildWebDirectoryStructure(
  routes: RouteMapping[],
  features: DetectedFeature[]
): string {
  const featureIds = new Set(features.map((f) => f.id));
  const pageRoutes = routes.filter((r) => r.screenType === "screen");
  const modals = routes.filter((r) => r.screenType === "modal");
  const drawers = routes.filter((r) => r.screenType === "drawer");

  const authPages = pageRoutes.filter((r) => isAuthScreen(r));
  const mainPages = pageRoutes.filter((r) => !isAuthScreen(r));

  const lines: string[] = ["src/"];

  // app/ directory
  lines.push("├── app/");
  lines.push("│   ├── layout.tsx              # Root layout with providers");
  lines.push("│   ├── globals.css             # Tailwind imports");

  // Auth route group
  if (authPages.length > 0) {
    lines.push("│   ├── (auth)/");
    lines.push("│   │   ├── layout.tsx          # Auth layout (no main nav)");
    for (const page of authPages) {
      const slug = slugify(page.screenName);
      lines.push(`│   │   └── ${slug}/page.tsx`);
    }
  }

  // Main route group
  if (mainPages.length > 0) {
    lines.push("│   ├── (main)/");
    lines.push("│   │   ├── layout.tsx          # Main layout with navigation");
    for (let i = 0; i < mainPages.length; i++) {
      const page = mainPages[i];
      const prefix = i === mainPages.length - 1 ? "└" : "├";
      if (page.routePath === "/") {
        lines.push(`│   │   ${prefix}── page.tsx`);
      } else {
        const slug = page.routePath.replace(/^\//, "");
        lines.push(`│   │   ${prefix}── ${slug}/page.tsx`);
      }
    }
  }

  // API routes
  if (featureIds.has("auth") || featureIds.has("commerce")) {
    lines.push("│   └── api/");
    if (featureIds.has("auth")) {
      lines.push("│       ├── auth/callback/route.ts");
    }
    if (featureIds.has("commerce")) {
      lines.push("│       └── stripe/webhook/route.ts");
    }
  }

  // components/
  lines.push("├── components/");
  lines.push("│   ├── ui/                     # Shared UI primitives");

  if (modals.length > 0) {
    lines.push("│   ├── modals/");
    for (const modal of modals) {
      lines.push(
        `│   │   └── ${modal.fileName}`
      );
    }
  }

  if (drawers.length > 0) {
    lines.push("│   ├── drawers/");
    for (const drawer of drawers) {
      lines.push(
        `│   │   └── ${drawer.fileName}`
      );
    }
  }

  lines.push("│   └── navigation/             # Nav components");

  // lib/
  lines.push("├── lib/");
  if (featureIds.has("auth")) {
    lines.push("│   ├── supabase/");
    lines.push("│   │   ├── client.ts           # Browser client");
    lines.push("│   │   ├── server.ts           # Server client");
    lines.push("│   │   └── middleware.ts        # Auth middleware");
  }
  lines.push("│   └── utils.ts");

  // Config files
  lines.push("├── .env.local                  # Environment variables");
  lines.push("├── tailwind.config.ts");
  lines.push("└── package.json");

  return lines.join("\n");
}

/** Build a directory structure tree string for Flutter */
function buildFlutterDirectoryStructure(
  routes: RouteMapping[],
  features: DetectedFeature[]
): string {
  const featureIds = new Set(features.map((f) => f.id));
  const pageRoutes = routes.filter((r) => r.screenType === "screen");
  const modals = routes.filter((r) => r.screenType === "modal");
  const drawers = routes.filter((r) => r.screenType === "drawer");

  const lines: string[] = ["lib/"];
  lines.push("├── main.dart                   # App entry point");
  lines.push("├── app/");
  lines.push("│   ├── app.dart                # MaterialApp + theme");
  lines.push("│   └── router.dart             # GoRouter configuration");

  // screens/
  lines.push("├── screens/");
  for (const page of pageRoutes) {
    lines.push(`│   ├── ${page.fileName}`);
  }

  // widgets/
  lines.push("├── widgets/");
  if (modals.length > 0) {
    lines.push("│   ├── modals/");
    for (const modal of modals) {
      lines.push(`│   │   └── ${modal.fileName}`);
    }
  }
  if (drawers.length > 0) {
    lines.push("│   ├── drawers/");
    for (const drawer of drawers) {
      lines.push(`│   │   └── ${drawer.fileName}`);
    }
  }
  lines.push("│   └── common/                 # Shared widgets");

  // providers/
  lines.push("├── providers/");
  if (featureIds.has("auth")) {
    lines.push("│   ├── auth_provider.dart");
  }
  lines.push("│   └── app_providers.dart");

  // services/
  if (featureIds.has("auth") || featureIds.has("commerce")) {
    lines.push("├── services/");
    if (featureIds.has("auth")) {
      lines.push("│   ├── supabase_service.dart");
    }
    if (featureIds.has("commerce")) {
      lines.push("│   └── stripe_service.dart");
    }
  }

  // models/
  lines.push("└── models/                     # Data models");

  return lines.join("\n");
}

/** Format the complete blueprint as markdown */
export function formatBlueprint(
  blueprint: ProjectBlueprint,
  context: ProjectContext | null
): string {
  const isMobile = blueprint.platform === "mobile";

  // Build dynamic sections
  const envVars = buildEnvVars(blueprint.detectedFeatures, isMobile);
  const setupCommands = buildSetupCommands(blueprint, isMobile);
  const configNotes = buildConfigNotes(blueprint.detectedFeatures, isMobile);
  const directoryStructure = isMobile
    ? buildFlutterDirectoryStructure(blueprint.routes, blueprint.detectedFeatures)
    : buildWebDirectoryStructure(blueprint.routes, blueprint.detectedFeatures);

  const sections: string[] = [];

  // --- Header ---
  sections.push(`# Application Blueprint: ${blueprint.projectName}`);
  if (blueprint.description) {
    sections.push(`\n${blueprint.description}`);
  }
  if (context) {
    const contextParts: string[] = [];
    if (context.appType) contextParts.push(`**App Type**: ${context.appType}`);
    if (context.targetAudience)
      contextParts.push(`**Target Audience**: ${context.targetAudience}`);
    if (context.brandStyle)
      contextParts.push(`**Brand Style**: ${context.brandStyle}`);
    if (context.keyFeatures?.length)
      contextParts.push(
        `**Key Features**: ${(context.keyFeatures as string[]).join(", ")}`
      );
    if (contextParts.length > 0) {
      sections.push(`\n${contextParts.join(" | ")}`);
    }
  }

  // --- Tech Stack ---
  sections.push(`\n## Tech Stack\n`);
  sections.push(`- **Framework**: ${blueprint.framework}`);
  sections.push(`- **Language**: ${blueprint.language}`);
  sections.push(`- **Styling**: ${blueprint.styling}`);

  const featureIds = new Set(blueprint.detectedFeatures.map((f) => f.id));
  if (featureIds.has("auth")) {
    sections.push(
      `- **Auth & Database**: Supabase (PostgreSQL + Auth${featureIds.has("oauth") ? " + OAuth" : ""}${featureIds.has("file-upload") ? " + Storage" : ""})`
    );
  }
  if (featureIds.has("commerce")) {
    sections.push(`- **Payments**: Stripe`);
  }

  // --- Detected Features ---
  if (blueprint.detectedFeatures.length > 0) {
    sections.push(`\n## Detected Features\n`);
    sections.push(`| Feature | Confidence | Detected On |`);
    sections.push(`|---------|------------|-------------|`);
    for (const f of blueprint.detectedFeatures) {
      sections.push(
        `| ${f.name} | ${f.confidence} | ${f.detectedFrom.join(", ")} |`
      );
    }
  }

  // --- Packages ---
  sections.push(`\n## Packages\n`);
  sections.push(`| Package | Version | Purpose |`);
  sections.push(`|---------|---------|---------|`);
  for (const pkg of blueprint.packages) {
    sections.push(`| ${pkg.name} | ${pkg.version} | ${pkg.purpose} |`);
  }

  // --- Routes ---
  const pageRoutes = blueprint.routes.filter((r) => r.screenType === "screen");
  const modalRoutes = blueprint.routes.filter((r) => r.screenType === "modal");
  const drawerRoutes = blueprint.routes.filter(
    (r) => r.screenType === "drawer"
  );

  sections.push(`\n## Routes & Screens\n`);

  if (pageRoutes.length > 0) {
    sections.push(`### Page Routes\n`);
    sections.push(`| Screen | Route | Component | File | Key Elements |`);
    sections.push(`|--------|-------|-----------|------|--------------|`);
    for (const r of pageRoutes) {
      const elements = r.keyComponentTypes.slice(0, 5).join(", ");
      const filePath = isMobile
        ? `screens/${r.fileName}`
        : `app/${r.fileName}`;
      sections.push(
        `| ${r.screenName} | ${r.routePath} | ${r.componentName} | ${filePath} | ${elements} |`
      );
    }
  }

  if (modalRoutes.length > 0) {
    sections.push(`\n### Modal Components\n`);
    sections.push(`| Screen | Component | File |`);
    sections.push(`|--------|-----------|------|`);
    for (const r of modalRoutes) {
      const filePath = isMobile
        ? `widgets/modals/${r.fileName}`
        : `components/modals/${r.fileName}`;
      sections.push(`| ${r.screenName} | ${r.componentName} | ${filePath} |`);
    }
  }

  if (drawerRoutes.length > 0) {
    sections.push(`\n### Drawer Components\n`);
    sections.push(`| Screen | Component | File |`);
    sections.push(`|--------|-----------|------|`);
    for (const r of drawerRoutes) {
      const filePath = isMobile
        ? `widgets/drawers/${r.fileName}`
        : `components/drawers/${r.fileName}`;
      sections.push(`| ${r.screenName} | ${r.componentName} | ${filePath} |`);
    }
  }

  // --- Navigation ---
  sections.push(`\n## Navigation Structure\n`);
  sections.push(`- **Type**: ${blueprint.navigation.type}`);
  sections.push(`- **Entry Screen**: ${blueprint.navigation.entryScreen}`);
  if (blueprint.navigation.primaryNav.length > 0) {
    sections.push(
      `- **Primary Nav Items**: ${blueprint.navigation.primaryNav.join(", ")}`
    );
  }

  // --- Navigation Graph ---
  const routesWithNav = blueprint.routes.filter(
    (r) => r.navigatesTo.length > 0
  );
  if (routesWithNav.length > 0) {
    sections.push(`\n## Navigation Graph\n`);
    sections.push("```");
    for (const r of routesWithNav) {
      for (const target of r.navigatesTo) {
        sections.push(`${r.screenName} → ${target}`);
      }
    }
    sections.push("```");
  }

  // --- Directory Structure ---
  sections.push(`\n## Project Structure\n`);
  sections.push("```");
  sections.push(directoryStructure);
  sections.push("```");

  // --- Environment Variables ---
  if (envVars.length > 0) {
    sections.push(`\n## Environment Variables\n`);
    sections.push("```");
    for (const v of envVars) {
      sections.push(v);
    }
    sections.push("```");
  }

  // --- Setup Commands ---
  if (setupCommands.length > 0) {
    sections.push(`\n## Setup Commands\n`);
    sections.push("```bash");
    for (const cmd of setupCommands) {
      sections.push(cmd);
    }
    sections.push("```");
  }

  // --- Config Notes ---
  if (configNotes.length > 0) {
    sections.push(`\n## Configuration Notes\n`);
    for (const note of configNotes) {
      sections.push(`- ${note}`);
    }
  }

  return sections.join("\n");
}
