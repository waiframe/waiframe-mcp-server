/**
 * Static component catalog data for the MCP resource.
 * Sourced from apps/web/src/lib/ai/component-schema.ts
 *
 * This is a text summary format optimized for AI code generation context.
 */

export interface ComponentData {
  type: string;
  category: string;
  description: string;
  props: Record<string, string>;
}

export const COMPONENT_CATALOG: ComponentData[] = [
  // BUTTONS
  { type: "button-primary", category: "buttons", description: "Main call-to-action button with solid background", props: { label: "string", disabled: "boolean?", icon: "string?" } },
  { type: "button-secondary", category: "buttons", description: "Secondary button with subtle styling", props: { label: "string", disabled: "boolean?", icon: "string?" } },
  { type: "button-outline", category: "buttons", description: "Button with border only, no fill", props: { label: "string", disabled: "boolean?" } },
  { type: "button-ghost", category: "buttons", description: "Transparent button, visible on hover", props: { label: "string", disabled: "boolean?" } },
  { type: "button-link", category: "buttons", description: "Text-only button styled as a link", props: { label: "string", disabled: "boolean?" } },
  { type: "icon-button", category: "buttons", description: "Square button with only an icon", props: { icon: "string (Lucide icon name)", disabled: "boolean?" } },
  { type: "fab", category: "buttons", description: "Floating action button, circular", props: { icon: "string", fixed: "boolean?", fixedVertical: "enum:top|center|bottom", fixedHorizontal: "enum:left|center|right" } },
  { type: "social-button", category: "buttons", description: "Social login button (Google, Apple, Facebook, etc.)", props: { text: "string", provider: "enum:google|apple|facebook|twitter|github|microsoft" } },

  // FORM INPUTS
  { type: "text-input", category: "form", description: "Single-line text input with built-in label", props: { label: "string?", placeholder: "string?", value: "string?", disabled: "boolean?" } },
  { type: "email-input", category: "form", description: "Email input with email keyboard on mobile", props: { label: "string?", placeholder: "string?", disabled: "boolean?" } },
  { type: "password-input", category: "form", description: "Password input with masked characters", props: { label: "string?", placeholder: "string?", disabled: "boolean?" } },
  { type: "phone-input", category: "form", description: "Phone number input", props: { label: "string?", placeholder: "string?", disabled: "boolean?" } },
  { type: "number-input", category: "form", description: "Numeric input", props: { label: "string?", placeholder: "string?", min: "number?", max: "number?", disabled: "boolean?" } },
  { type: "textarea", category: "form", description: "Multi-line text area", props: { label: "string?", placeholder: "string?", rows: "number?", disabled: "boolean?" } },
  { type: "search-bar", category: "form", description: "Search input with search icon", props: { placeholder: "string?", value: "string?" } },
  { type: "dropdown", category: "form", description: "Dropdown select with options", props: { label: "string?", placeholder: "string?", items: "string[]", disabled: "boolean?" } },
  { type: "checkbox", category: "form", description: "Checkbox with label", props: { label: "string", checked: "boolean?" } },
  { type: "radio-group", category: "form", description: "Radio button group", props: { label: "string?", items: "string[]", selected: "number?" } },
  { type: "toggle", category: "form", description: "Toggle/switch control", props: { label: "string?", checked: "boolean?" } },
  { type: "slider", category: "form", description: "Range slider", props: { label: "string?", min: "number?", max: "number?", value: "number?" } },
  { type: "date-picker", category: "form", description: "Date selection input", props: { label: "string?", placeholder: "string?" } },
  { type: "file-upload", category: "form", description: "File upload area", props: { label: "string?", accept: "string?", multiple: "boolean?" } },

  // TYPOGRAPHY
  { type: "heading", category: "typography", description: "Heading text (h1-h6 level)", props: { text: "string", level: "enum:1|2|3|4|5|6" } },
  { type: "paragraph", category: "typography", description: "Body text paragraph", props: { text: "string" } },
  { type: "label", category: "typography", description: "Small label text", props: { text: "string" } },

  // DATA DISPLAY
  { type: "avatar", category: "data-display", description: "User avatar circle", props: { initials: "string?", size: "enum:sm|md|lg" } },
  { type: "badge", category: "data-display", description: "Status badge/tag", props: { text: "string", variant: "enum:default|success|warning|error|info" } },
  { type: "stat-card", category: "data-display", description: "Metric card with label, value, and optional change indicator", props: { label: "string", value: "string", change: "string?", changeType: "enum:positive|negative|neutral" } },
  { type: "rating", category: "data-display", description: "Star rating display", props: { value: "number", max: "number?" } },
  { type: "progress-bar", category: "data-display", description: "Progress indicator bar", props: { value: "number", max: "number?", label: "string?" } },
  { type: "tag", category: "data-display", description: "Removable tag/chip", props: { text: "string", removable: "boolean?" } },

  // LAYOUT
  { type: "card", category: "layout", description: "Content card container", props: { title: "string?", padding: "boolean?" } },
  { type: "container", category: "layout", description: "Generic container/section wrapper", props: { padding: "boolean?" } },
  { type: "divider", category: "layout", description: "Horizontal divider line", props: { label: "string?" } },
  { type: "spacer", category: "layout", description: "Empty spacing element", props: { height: "number?" } },
  { type: "accordion", category: "layout", description: "Expandable section", props: { title: "string", expanded: "boolean?" } },
  { type: "tabs", category: "layout", description: "Tab panel container", props: { items: "string[]", activeIndex: "number?" } },

  // NAVIGATION
  { type: "navbar", category: "navigation", description: "Top navigation bar", props: { title: "string?", showBack: "boolean?", showMenu: "boolean?" } },
  { type: "bottom-nav", category: "navigation", description: "Bottom tab navigation bar", props: { items: "string[]", activeIndex: "number?", icons: "string[]?" } },
  { type: "tab-bar", category: "navigation", description: "Horizontal tab bar", props: { items: "string[]", activeIndex: "number?" } },
  { type: "sidebar", category: "navigation", description: "Side navigation panel", props: { title: "string?", items: "string[]", activeIndex: "number?" } },
  { type: "header", category: "navigation", description: "Desktop page header with nav", props: { title: "string?", items: "string[]?", showLogo: "boolean?" } },
  { type: "breadcrumb", category: "navigation", description: "Breadcrumb trail", props: { items: "string[]" } },
  { type: "pagination", category: "navigation", description: "Page navigation controls", props: { totalPages: "number?", currentPage: "number?" } },
  { type: "stepper", category: "navigation", description: "Step progress indicator", props: { steps: "string[]", currentStep: "number?" } },

  // LIST
  { type: "list", category: "list", description: "Vertical list of items", props: { items: "string[]", showDividers: "boolean?", showArrows: "boolean?" } },
  { type: "product-card", category: "list", description: "E-commerce product card with image area, title, price", props: { title: "string?", price: "string?", image: "boolean?" } },

  // MEDIA
  { type: "image", category: "media", description: "Image placeholder", props: { alt: "string?", aspectRatio: "enum:1:1|4:3|16:9|3:2" } },
  { type: "video-placeholder", category: "media", description: "Video placeholder with play button", props: { aspectRatio: "enum:16:9|4:3" } },
  { type: "logo-placeholder", category: "media", description: "Logo/brand placeholder", props: { size: "enum:sm|md|lg" } },
  { type: "icon", category: "media", description: "Single icon display", props: { name: "string (Lucide icon name)", size: "enum:sm|md|lg" } },
  { type: "map-placeholder", category: "media", description: "Map view placeholder", props: { aspectRatio: "enum:1:1|4:3|16:9" } },
  { type: "chart-placeholder", category: "media", description: "Chart/graph placeholder", props: { chartType: "enum:bar|line|pie|area", title: "string?" } },
  { type: "carousel", category: "media", description: "Image/content carousel", props: { itemCount: "number?", showDots: "boolean?", showArrows: "boolean?" } },

  // FEEDBACK
  { type: "alert", category: "feedback", description: "Alert/notification banner", props: { title: "string?", message: "string", variant: "enum:info|success|warning|error" } },
  { type: "toast", category: "feedback", description: "Toast notification", props: { message: "string", variant: "enum:info|success|warning|error" } },
  { type: "modal", category: "feedback", description: "Modal dialog overlay", props: { title: "string?", showClose: "boolean?" } },
  { type: "tooltip", category: "feedback", description: "Tooltip popup", props: { text: "string" } },
  { type: "skeleton", category: "feedback", description: "Loading skeleton placeholder", props: { lines: "number?", avatar: "boolean?" } },
  { type: "empty-state", category: "feedback", description: "Empty state with illustration placeholder", props: { title: "string?", message: "string?", showAction: "boolean?" } },

  // DATA
  { type: "table", category: "data", description: "Data table with columns", props: { columns: "string[]", rows: "number?", showHeader: "boolean?" } },
  { type: "calendar", category: "data", description: "Calendar view", props: { showHeader: "boolean?" } },
  { type: "timeline", category: "data", description: "Vertical timeline", props: { items: "string[]" } },
];

export function formatComponentCatalogText(): string {
  const lines = ["# Waiframe Component Catalog", ""];
  let currentCategory = "";

  for (const c of COMPONENT_CATALOG) {
    if (c.category !== currentCategory) {
      currentCategory = c.category;
      lines.push(`## ${currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)}`, "");
    }
    const propsStr = Object.entries(c.props)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
    lines.push(`- **${c.type}**: ${c.description}`);
    lines.push(`  Props: ${propsStr}`);
  }

  return lines.join("\n");
}

export function getComponentByType(type: string): ComponentData | undefined {
  return COMPONENT_CATALOG.find((c) => c.type === type);
}
