import type { Screen, WireframeElement, Connection, SemanticElement, SemanticScreen } from "../types.js";

/**
 * Properties to strip from elements (not useful for AI code generation).
 */
const STRIP_PROPS = new Set(["locked", "hidden", "zIndex"]);

/**
 * Properties to always exclude from the semantic output.
 */
const EXCLUDE_ELEMENT_FIELDS = new Set(["id", "position", "size", "locked", "hidden", "zIndex"]);

/**
 * Build a map of screenId -> screenName for resolving connections.
 */
export function buildScreenNameMap(screens: Screen[]): Map<string, string> {
  return new Map(screens.map((s) => [s.id, s.name]));
}

/**
 * Transform a raw element into a semantic representation.
 * Strips UUIDs, positions, sizes. Keeps component type and relevant props.
 */
function transformElement(
  element: WireframeElement,
  connections: Connection[],
  screenNameMap: Map<string, string>
): SemanticElement {
  // Clean properties — remove empty/null values
  const props: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(element.properties || {})) {
    if (STRIP_PROPS.has(key)) continue;
    if (value === null || value === undefined || value === "") continue;
    props[key] = value;
  }

  const result: SemanticElement = {
    component: element.type,
    props,
  };

  // Resolve navigation connections for this element
  const elementConnections = connections.filter((c) => c.fromElement === element.id);
  for (const conn of elementConnections) {
    if (conn.action.toScreen) {
      const screenName = screenNameMap.get(conn.action.toScreen);
      if (screenName) {
        // If connection has an itemIndex, note which item triggers navigation
        if (conn.itemIndex !== undefined) {
          const items = element.properties?.items as string[] | undefined;
          const itemLabel = items?.[conn.itemIndex];
          result.navigates_to = `${screenName}${itemLabel ? ` (from "${itemLabel}")` : ` (item ${conn.itemIndex})`}`;
        } else {
          result.navigates_to = screenName;
        }
      }
    }
    if (conn.action.modalId) {
      const modalName = screenNameMap.get(conn.action.modalId);
      if (modalName) result.navigates_to = `${modalName} (modal)`;
    }
    if (conn.action.drawerId) {
      const drawerName = screenNameMap.get(conn.action.drawerId);
      if (drawerName) result.navigates_to = `${drawerName} (drawer)`;
    }
  }

  // Transform children recursively
  if (element.children && element.children.length > 0) {
    result.children = element.children.map((child) =>
      transformElement(child, connections, screenNameMap)
    );
  }

  return result;
}

/**
 * Transform a raw screen into a semantic representation.
 * Elements are sorted by Y-position (top to bottom reading order).
 */
export function transformScreen(
  screen: Screen,
  screenNameMap: Map<string, string>
): SemanticScreen {
  // Sort elements by Y position (top to bottom)
  const sortedElements = [...screen.elements].sort(
    (a, b) => (a.position?.y || 0) - (b.position?.y || 0)
  );

  return {
    name: screen.name,
    type: screen.screenType,
    elements: sortedElements.map((el) =>
      transformElement(el, screen.connections, screenNameMap)
    ),
  };
}

/**
 * Transform all screens in a project into semantic format.
 */
export function transformAllScreens(screens: Screen[]): SemanticScreen[] {
  const screenNameMap = buildScreenNameMap(screens);
  return screens.map((s) => transformScreen(s, screenNameMap));
}
