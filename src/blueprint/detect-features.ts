import type { Screen, WireframeElement } from "../types.js";
import type { DetectedFeature } from "./types.js";

interface ScreenAnalysis {
  screenName: string;
  screenType: string;
  componentTypes: Set<string>;
}

/** Recursively collect all element types from a tree of elements */
function collectElementTypes(
  elements: WireframeElement[],
  types: Map<string, number>
): void {
  for (const el of elements) {
    types.set(el.type, (types.get(el.type) || 0) + 1);
    if (el.children?.length) {
      collectElementTypes(el.children, types);
    }
  }
}

/** Collect per-screen component type sets */
function analyzeScreens(screens: Screen[]): ScreenAnalysis[] {
  return screens.map((screen) => {
    const types = new Map<string, number>();
    collectElementTypes(screen.elements, types);
    return {
      screenName: screen.name,
      screenType: screen.screenType,
      componentTypes: new Set(types.keys()),
    };
  });
}

/** Check if a screen name matches any of the given keywords */
function screenNameMatches(name: string, keywords: string[]): boolean {
  const lower = name.toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
}

const AUTH_KEYWORDS = ["login", "signin", "sign-in", "signup", "sign-up", "register", "auth"];
const COMMERCE_KEYWORDS = ["cart", "checkout", "payment", "shop", "store", "order"];
const CHAT_KEYWORDS = ["chat", "message", "inbox", "conversation", "dm"];
const DASHBOARD_KEYWORDS = ["dashboard", "analytics", "overview", "admin"];

const FORM_COMPONENT_TYPES = new Set([
  "text-input", "email-input", "password-input", "phone-input",
  "number-input", "textarea", "dropdown", "checkbox", "radio",
  "toggle", "slider", "date-picker", "time-picker", "file-upload",
]);

export function detectFeatures(screens: Screen[]): DetectedFeature[] {
  const features: DetectedFeature[] = [];
  const globalTypes = new Map<string, number>();
  const screenAnalyses = analyzeScreens(screens);

  // Build global component type counts
  for (const screen of screens) {
    collectElementTypes(screen.elements, globalTypes);
  }

  // --- Auth ---
  const authScreens = screenAnalyses.filter((s) => {
    const hasEmailAndPassword =
      s.componentTypes.has("email-input") && s.componentTypes.has("password-input");
    const nameMatch = screenNameMatches(s.screenName, AUTH_KEYWORDS);
    return hasEmailAndPassword || nameMatch;
  });
  if (authScreens.length > 0) {
    const hasComponents = authScreens.some(
      (s) => s.componentTypes.has("email-input") && s.componentTypes.has("password-input")
    );
    const hasNameMatch = authScreens.some((s) =>
      screenNameMatches(s.screenName, AUTH_KEYWORDS)
    );
    features.push({
      id: "auth",
      name: "Authentication",
      confidence: hasComponents && hasNameMatch ? "high" : "medium",
      detectedFrom: authScreens.map((s) => s.screenName),
    });
  }

  // --- OAuth ---
  if (globalTypes.has("social-button")) {
    const oauthScreens = screenAnalyses
      .filter((s) => s.componentTypes.has("social-button"))
      .map((s) => s.screenName);
    features.push({
      id: "oauth",
      name: "OAuth / Social Login",
      confidence: "high",
      detectedFrom: oauthScreens,
    });
    // Also ensure auth is detected
    if (!features.find((f) => f.id === "auth")) {
      features.push({
        id: "auth",
        name: "Authentication",
        confidence: "high",
        detectedFrom: oauthScreens,
      });
    }
  }

  // --- Commerce ---
  const productCardCount = globalTypes.get("product-card") || 0;
  const commerceScreenNames = screenAnalyses
    .filter((s) => screenNameMatches(s.screenName, COMMERCE_KEYWORDS))
    .map((s) => s.screenName);
  if (productCardCount >= 2 || commerceScreenNames.length > 0) {
    const detectedFrom = [
      ...screenAnalyses
        .filter((s) => s.componentTypes.has("product-card"))
        .map((s) => s.screenName),
      ...commerceScreenNames,
    ];
    features.push({
      id: "commerce",
      name: "E-Commerce",
      confidence:
        productCardCount >= 2 && commerceScreenNames.length > 0 ? "high" : "medium",
      detectedFrom: [...new Set(detectedFrom)],
    });
  }

  // --- Simple component-based features ---
  const simpleRules: Array<{
    id: string;
    name: string;
    triggers: string[];
    minCount?: number;
  }> = [
    { id: "charts", name: "Charts & Graphs", triggers: ["chart-placeholder"] },
    { id: "maps", name: "Maps", triggers: ["map-placeholder"] },
    { id: "data-tables", name: "Data Tables", triggers: ["table"] },
    { id: "file-upload", name: "File Upload", triggers: ["file-upload"] },
    { id: "video", name: "Video Player", triggers: ["video-placeholder"] },
    { id: "image-carousel", name: "Image Carousel", triggers: ["carousel", "gallery"] },
    { id: "calendar", name: "Calendar", triggers: ["calendar"] },
    { id: "search", name: "Search", triggers: ["search-bar", "search-input"] },
    { id: "notifications", name: "Notifications & Alerts", triggers: ["toast", "alert"] },
    { id: "timeline", name: "Timeline", triggers: ["timeline"] },
    { id: "ratings", name: "Ratings", triggers: ["rating"] },
  ];

  for (const rule of simpleRules) {
    const matchingScreens = screenAnalyses.filter((s) =>
      rule.triggers.some((t) => s.componentTypes.has(t))
    );
    const totalCount = rule.triggers.reduce(
      (sum, t) => sum + (globalTypes.get(t) || 0),
      0
    );
    if (totalCount >= (rule.minCount || 1)) {
      features.push({
        id: rule.id,
        name: rule.name,
        confidence: "high",
        detectedFrom: matchingScreens.map((s) => s.screenName),
      });
    }
  }

  // --- Dashboard ---
  const statCardCount = globalTypes.get("stat-card") || 0;
  if (statCardCount >= 2) {
    const dashboardScreens = screenAnalyses
      .filter(
        (s) =>
          s.componentTypes.has("stat-card") ||
          screenNameMatches(s.screenName, DASHBOARD_KEYWORDS)
      )
      .map((s) => s.screenName);
    features.push({
      id: "dashboard",
      name: "Dashboard",
      confidence: dashboardScreens.some((n) =>
        screenNameMatches(n, DASHBOARD_KEYWORDS)
      )
        ? "high"
        : "medium",
      detectedFrom: dashboardScreens,
    });
  }

  // --- Tab Navigation ---
  if (globalTypes.has("bottom-nav") || globalTypes.has("tab-bar")) {
    features.push({
      id: "tab-navigation",
      name: "Tab Navigation",
      confidence: "high",
      detectedFrom: screenAnalyses
        .filter(
          (s) =>
            s.componentTypes.has("bottom-nav") || s.componentTypes.has("tab-bar")
        )
        .map((s) => s.screenName),
    });
  }

  // --- Sidebar Navigation ---
  if (globalTypes.has("sidebar")) {
    features.push({
      id: "sidebar-navigation",
      name: "Sidebar Navigation",
      confidence: "high",
      detectedFrom: screenAnalyses
        .filter((s) => s.componentTypes.has("sidebar"))
        .map((s) => s.screenName),
    });
  }

  // --- Modals ---
  const modalScreens = screenAnalyses.filter(
    (s) => s.screenType === "modal"
  );
  if (modalScreens.length > 0 || globalTypes.has("modal")) {
    features.push({
      id: "modals",
      name: "Modal Dialogs",
      confidence: "high",
      detectedFrom: modalScreens.map((s) => s.screenName),
    });
  }

  // --- Drawers ---
  const drawerScreens = screenAnalyses.filter(
    (s) => s.screenType === "drawer"
  );
  if (drawerScreens.length > 0) {
    features.push({
      id: "drawers",
      name: "Drawer Panels",
      confidence: "high",
      detectedFrom: drawerScreens.map((s) => s.screenName),
    });
  }

  // --- Forms (3+ form components on a single screen) ---
  const formScreens = screenAnalyses.filter((s) => {
    let formCount = 0;
    for (const type of s.componentTypes) {
      if (FORM_COMPONENT_TYPES.has(type)) formCount++;
    }
    return formCount >= 3;
  });
  if (formScreens.length > 0) {
    features.push({
      id: "forms",
      name: "Complex Forms",
      confidence: "high",
      detectedFrom: formScreens.map((s) => s.screenName),
    });
  }

  // --- Chat ---
  const chatScreens = screenAnalyses.filter(
    (s) =>
      screenNameMatches(s.screenName, CHAT_KEYWORDS) ||
      (s.componentTypes.has("text-input") && s.componentTypes.has("avatar"))
  );
  if (chatScreens.length > 0) {
    features.push({
      id: "chat",
      name: "Chat / Messaging",
      confidence: chatScreens.some((s) =>
        screenNameMatches(s.screenName, CHAT_KEYWORDS)
      )
        ? "high"
        : "medium",
      detectedFrom: chatScreens.map((s) => s.screenName),
    });
  }

  return features;
}
