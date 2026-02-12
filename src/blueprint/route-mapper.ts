import type { Screen, Flow, WireframeElement } from "../types.js";
import type { RouteMapping, NavigationStructure } from "./types.js";

const HOME_SLUGS = new Set(["home", "main", "landing", "index"]);

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function screenNameToRoutePath(name: string): string {
  const slug = slugify(name);
  if (HOME_SLUGS.has(slug)) return "/";
  return `/${slug}`;
}

function screenNameToComponentName(name: string): string {
  return (
    name
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join("") + "Page"
  );
}

function screenNameToWebFileName(name: string): string {
  const slug = slugify(name);
  if (HOME_SLUGS.has(slug)) return "page.tsx";
  return `${slug}/page.tsx`;
}

function screenNameToFlutterFileName(name: string): string {
  const slug = slugify(name).replace(/-/g, "_");
  return `${slug}_screen.dart`;
}

/** Recursively collect all unique component types from elements */
function collectComponentTypes(elements: WireframeElement[]): Set<string> {
  const types = new Set<string>();
  for (const el of elements) {
    types.add(el.type);
    if (el.children?.length) {
      for (const t of collectComponentTypes(el.children)) {
        types.add(t);
      }
    }
  }
  return types;
}

/** Build a map of screen IDs to screen names */
function buildScreenIdToNameMap(screens: Screen[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const screen of screens) {
    map.set(screen.id, screen.name);
  }
  return map;
}

/** Get navigation targets for a screen from its connections */
function getNavigationTargets(
  screen: Screen,
  idToName: Map<string, string>
): string[] {
  const targets = new Set<string>();
  for (const conn of screen.connections) {
    if (conn.action.type === "navigate" && conn.action.toScreen) {
      const name = idToName.get(conn.action.toScreen);
      if (name) targets.add(name);
    }
    if (conn.action.type === "toggle-modal" && conn.action.modalId) {
      const name = idToName.get(conn.action.modalId);
      if (name) targets.add(name);
    }
    if (conn.action.type === "toggle-drawer" && conn.action.drawerId) {
      const name = idToName.get(conn.action.drawerId as string);
      if (name) targets.add(name);
    }
  }
  return [...targets];
}

/** Detect the primary navigation structure from screen elements */
function detectNavStructure(
  screens: Screen[],
  flows: Flow[],
  idToName: Map<string, string>
): NavigationStructure {
  let hasTabNav = false;
  let hasSidebar = false;
  let hasDrawerNav = false;
  const tabItems: string[] = [];
  const sidebarItems: string[] = [];

  for (const screen of screens) {
    if (screen.screenType === "drawer") {
      hasDrawerNav = true;
      continue;
    }
    if (screen.screenType !== "screen") continue;

    const types = collectComponentTypes(screen.elements);

    if (types.has("bottom-nav") || types.has("tab-bar")) {
      hasTabNav = true;
      // Extract nav item labels from properties
      for (const el of screen.elements) {
        if (
          (el.type === "bottom-nav" || el.type === "tab-bar") &&
          Array.isArray(el.properties?.items)
        ) {
          for (const item of el.properties.items as Array<{ label?: string }>) {
            if (item.label && !tabItems.includes(item.label)) {
              tabItems.push(item.label);
            }
          }
        }
      }
    }

    if (types.has("sidebar")) {
      hasSidebar = true;
      for (const el of screen.elements) {
        if (el.type === "sidebar" && Array.isArray(el.properties?.items)) {
          for (const item of el.properties.items as Array<{ label?: string }>) {
            if (item.label && !sidebarItems.includes(item.label)) {
              sidebarItems.push(item.label);
            }
          }
        }
      }
    }
  }

  // Determine entry screen
  let entryScreen = screens[0]?.name || "Home";

  // Prefer main flow's entry screen
  const mainFlow = flows.find((f) => f.name.toLowerCase().includes("main")) || flows[0];
  if (mainFlow?.entryScreenName) {
    entryScreen = mainFlow.entryScreenName;
  } else if (mainFlow?.entryScreen) {
    const name = idToName.get(mainFlow.entryScreen);
    if (name) entryScreen = name;
  }

  // Determine nav type
  let type: NavigationStructure["type"] = "stack";
  let primaryNav: string[] = [];

  if (hasTabNav && hasSidebar) {
    type = "hybrid";
    primaryNav = [...tabItems, ...sidebarItems];
  } else if (hasTabNav) {
    type = "tab-based";
    primaryNav = tabItems;
  } else if (hasSidebar) {
    type = "sidebar";
    primaryNav = sidebarItems;
  } else if (hasDrawerNav) {
    type = "drawer-based";
    primaryNav = [];
  }

  return { type, primaryNav, entryScreen };
}

/** Deduplicate route paths by appending suffix for conflicts */
function deduplicateRoutes(routes: RouteMapping[]): void {
  const pathCounts = new Map<string, number>();
  for (const route of routes) {
    const count = pathCounts.get(route.routePath) || 0;
    if (count > 0) {
      route.routePath = `${route.routePath}-${count + 1}`;
      route.fileName = route.fileName.replace(
        /\/page\.tsx$/,
        `-${count + 1}/page.tsx`
      );
    }
    pathCounts.set(route.routePath, count + 1);
  }
}

export function generateRoutes(
  screens: Screen[],
  flows: Flow[],
  platform: "mobile" | "desktop" | "tablet"
): { routes: RouteMapping[]; navigation: NavigationStructure } {
  const idToName = buildScreenIdToNameMap(screens);
  const isMobile = platform === "mobile";

  const routes: RouteMapping[] = screens
    .sort((a, b) => a.order - b.order)
    .map((screen) => {
      const componentTypes = collectComponentTypes(screen.elements);
      const navigatesTo = getNavigationTargets(screen, idToName);

      return {
        screenName: screen.name,
        screenType: screen.screenType as "screen" | "modal" | "drawer",
        routePath: screen.screenType === "screen"
          ? screenNameToRoutePath(screen.name)
          : "",
        componentName: screenNameToComponentName(screen.name),
        fileName: screen.screenType === "screen"
          ? (isMobile
              ? screenNameToFlutterFileName(screen.name)
              : screenNameToWebFileName(screen.name))
          : (isMobile
              ? `${slugify(screen.name).replace(/-/g, "_")}_${screen.screenType}.dart`
              : `${slugify(screen.name)}-${screen.screenType}.tsx`),
        keyComponentTypes: [...componentTypes],
        navigatesTo,
      };
    });

  // Deduplicate route paths for page screens
  const pageRoutes = routes.filter((r) => r.screenType === "screen");
  deduplicateRoutes(pageRoutes);

  const navigation = detectNavStructure(screens, flows, idToName);

  return { routes, navigation };
}
