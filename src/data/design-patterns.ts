/**
 * Static design pattern data for the MCP resource.
 * Sourced from apps/web/src/lib/ai/design-patterns.ts
 */

export interface DesignPatternData {
  id: string;
  name: string;
  category: string;
  platforms: string[];
  description: string;
  layout: string;
  keyComponents: string[];
  spacingStrategy: string;
}

export const DESIGN_PATTERNS: DesignPatternData[] = [
  { id: "auth-form-centered", name: "Centered Auth Form", category: "auth", platforms: ["mobile", "desktop", "tablet"], description: "Login/signup with centered card, logo above, social buttons below form", layout: "vertical-centered", keyComponents: ["logo-placeholder", "card", "email-input", "password-input", "button-primary", "social-button", "button-link"], spacingStrategy: "comfortable" },
  { id: "auth-split-screen", name: "Split Screen Auth", category: "auth", platforms: ["desktop", "tablet"], description: "Left panel with branding/hero image, right panel with auth form", layout: "horizontal-split", keyComponents: ["image", "heading", "paragraph", "email-input", "password-input", "button-primary", "social-button"], spacingStrategy: "spacious" },
  { id: "dashboard-stats-grid", name: "Stats Grid Dashboard", category: "dashboard", platforms: ["mobile", "desktop", "tablet"], description: "Top row of stat-cards followed by charts and recent activity list", layout: "stat-grid-then-content", keyComponents: ["stat-card", "chart-placeholder", "list", "heading"], spacingStrategy: "comfortable" },
  { id: "dashboard-sidebar-layout", name: "Sidebar Dashboard", category: "dashboard", platforms: ["desktop", "tablet"], description: "Persistent sidebar navigation with main content area showing stats and charts", layout: "sidebar-main", keyComponents: ["sidebar", "header", "stat-card", "chart-placeholder", "table"], spacingStrategy: "comfortable" },
  { id: "dashboard-mobile-cards", name: "Mobile Card Dashboard", category: "dashboard", platforms: ["mobile"], description: "Stacked cards with key metrics, scrollable activity feed, bottom navigation", layout: "vertical-scroll-cards", keyComponents: ["navbar", "stat-card", "card", "list", "bottom-nav"], spacingStrategy: "compact" },
  { id: "list-searchable", name: "Searchable List", category: "list", platforms: ["mobile", "desktop", "tablet"], description: "Search bar at top, filterable list with avatars and action indicators", layout: "search-then-list", keyComponents: ["search-bar", "tab-bar", "list", "fab"], spacingStrategy: "compact" },
  { id: "list-card-grid", name: "Card Grid", category: "list", platforms: ["desktop", "tablet"], description: "Grid of content cards with images, titles, and metadata", layout: "responsive-grid", keyComponents: ["search-bar", "card", "image", "heading", "badge"], spacingStrategy: "comfortable" },
  { id: "detail-hero-content", name: "Hero Detail Page", category: "detail", platforms: ["mobile", "desktop", "tablet"], description: "Large hero image/header, content sections below with actions", layout: "hero-then-content", keyComponents: ["image", "heading", "paragraph", "badge", "button-primary", "divider", "list"], spacingStrategy: "spacious" },
  { id: "detail-profile", name: "User Profile", category: "detail", platforms: ["mobile", "desktop", "tablet"], description: "Avatar with name/bio, stats row, tabbed content sections", layout: "profile-centered", keyComponents: ["avatar", "heading", "paragraph", "stat-card", "tab-bar", "list"], spacingStrategy: "comfortable" },
  { id: "detail-product", name: "Product Detail", category: "detail", platforms: ["mobile", "desktop", "tablet"], description: "Product image carousel, pricing, description, add to cart CTA", layout: "image-then-details", keyComponents: ["image", "heading", "paragraph", "badge", "rating", "button-primary", "button-outline"], spacingStrategy: "comfortable" },
  { id: "settings-grouped-list", name: "Grouped Settings", category: "settings", platforms: ["mobile", "desktop", "tablet"], description: "Categorized settings with toggles, list items, and navigation arrows", layout: "grouped-sections", keyComponents: ["heading", "list", "toggle", "divider", "avatar"], spacingStrategy: "compact" },
  { id: "onboarding-carousel", name: "Onboarding Carousel", category: "onboarding", platforms: ["mobile", "tablet"], description: "Full-screen slides with illustration, heading, description, progress dots, and CTA", layout: "full-screen-centered", keyComponents: ["image", "heading", "paragraph", "button-primary", "button-link"], spacingStrategy: "spacious" },
  { id: "commerce-product-list", name: "Product Catalog", category: "commerce", platforms: ["mobile", "desktop", "tablet"], description: "Product grid with filters, search, sorting, and product cards", layout: "filter-then-grid", keyComponents: ["search-bar", "tab-bar", "product-card", "badge"], spacingStrategy: "compact" },
  { id: "commerce-cart", name: "Shopping Cart", category: "commerce", platforms: ["mobile", "desktop", "tablet"], description: "Cart item list with quantities, price summary, and checkout CTA", layout: "list-then-summary", keyComponents: ["list", "heading", "paragraph", "divider", "button-primary", "stat-card"], spacingStrategy: "comfortable" },
  { id: "commerce-checkout", name: "Checkout Form", category: "commerce", platforms: ["mobile", "desktop", "tablet"], description: "Multi-section form with shipping, payment, and order summary", layout: "stepped-form", keyComponents: ["heading", "text-input", "email-input", "dropdown", "card", "button-primary", "divider"], spacingStrategy: "comfortable" },
  { id: "social-feed", name: "Social Feed", category: "social", platforms: ["mobile", "desktop", "tablet"], description: "Scrollable feed of post cards with avatar, content, images, and engagement actions", layout: "vertical-feed", keyComponents: ["card", "avatar", "paragraph", "image", "icon-button", "heading"], spacingStrategy: "compact" },
  { id: "messaging-chat", name: "Chat Interface", category: "messaging", platforms: ["mobile", "desktop", "tablet"], description: "Chat header, message bubbles area, bottom input with send button", layout: "header-content-input", keyComponents: ["navbar", "container", "card", "avatar", "text-input", "icon-button"], spacingStrategy: "compact" },
  { id: "messaging-inbox", name: "Message Inbox", category: "messaging", platforms: ["mobile", "desktop", "tablet"], description: "List of conversations with avatars, preview text, timestamps, and unread indicators", layout: "search-then-list", keyComponents: ["search-bar", "list", "avatar", "badge"], spacingStrategy: "compact" },
  { id: "content-article", name: "Article/Blog Page", category: "content", platforms: ["mobile", "desktop", "tablet"], description: "Hero image, title, metadata (author, date), body paragraphs with headings", layout: "article-flow", keyComponents: ["image", "heading", "paragraph", "avatar", "badge", "divider"], spacingStrategy: "spacious" },
];

export function formatDesignPatternsText(): string {
  const lines = ["# Waiframe Design Patterns", ""];
  let currentCategory = "";

  for (const p of DESIGN_PATTERNS) {
    if (p.category !== currentCategory) {
      currentCategory = p.category;
      lines.push(`## ${currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)}`, "");
    }
    lines.push(`### ${p.name} (${p.id})`);
    lines.push(`Platforms: ${p.platforms.join(", ")}`);
    lines.push(`Layout: ${p.layout} | Spacing: ${p.spacingStrategy}`);
    lines.push(`${p.description}`);
    lines.push(`Components: ${p.keyComponents.join(", ")}`);
    lines.push("");
  }

  return lines.join("\n");
}
