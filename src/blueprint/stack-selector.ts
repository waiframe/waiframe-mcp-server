import type { Platform } from "../types.js";
import type { DetectedFeature, PackageRecommendation } from "./types.js";

interface StackConfig {
  framework: string;
  language: string;
  styling: string;
  basePackages: PackageRecommendation[];
  featurePackages: Map<string, PackageRecommendation[]>;
}

function getWebStack(): StackConfig {
  return {
    framework: "Next.js 15 (App Router)",
    language: "TypeScript",
    styling: "Tailwind CSS v4",
    basePackages: [
      { name: "next", version: "^15.0", purpose: "React framework with App Router" },
      { name: "react", version: "^19.0", purpose: "UI library" },
      { name: "react-dom", version: "^19.0", purpose: "React DOM renderer" },
      { name: "tailwindcss", version: "^4.0", purpose: "Utility-first CSS" },
      { name: "lucide-react", version: "^0.460", purpose: "Icons (matches wireframe icon set)" },
    ],
    featurePackages: new Map([
      ["auth", [
        { name: "@supabase/supabase-js", version: "^2.0", purpose: "Auth + database client", featureId: "auth" },
        { name: "@supabase/ssr", version: "^0.5", purpose: "Supabase SSR helpers for Next.js", featureId: "auth" },
      ]],
      ["charts", [
        { name: "recharts", version: "^2.12", purpose: "Charts & data visualization", featureId: "charts" },
      ]],
      ["maps", [
        { name: "react-leaflet", version: "^5.0", purpose: "Interactive maps", featureId: "maps" },
        { name: "leaflet", version: "^1.9", purpose: "Map rendering engine", featureId: "maps" },
      ]],
      ["data-tables", [
        { name: "@tanstack/react-table", version: "^8.0", purpose: "Headless data table", featureId: "data-tables" },
      ]],
      ["commerce", [
        { name: "@stripe/stripe-js", version: "^4.0", purpose: "Client-side Stripe checkout", featureId: "commerce" },
        { name: "stripe", version: "^17.0", purpose: "Server-side Stripe API", featureId: "commerce" },
      ]],
      ["file-upload", [
        { name: "react-dropzone", version: "^14.0", purpose: "Drag & drop file upload", featureId: "file-upload" },
      ]],
      ["video", [
        { name: "react-player", version: "^2.16", purpose: "Video playback", featureId: "video" },
      ]],
      ["image-carousel", [
        { name: "embla-carousel-react", version: "^8.0", purpose: "Carousel / image slider", featureId: "image-carousel" },
      ]],
      ["calendar", [
        { name: "react-day-picker", version: "^9.0", purpose: "Calendar date picker", featureId: "calendar" },
        { name: "date-fns", version: "^4.0", purpose: "Date utility functions", featureId: "calendar" },
      ]],
      ["notifications", [
        { name: "sonner", version: "^1.7", purpose: "Toast notifications", featureId: "notifications" },
      ]],
      ["modals", [
        { name: "@radix-ui/react-dialog", version: "^1.1", purpose: "Accessible modal dialogs", featureId: "modals" },
      ]],
      ["drawers", [
        { name: "vaul", version: "^1.0", purpose: "Drawer component", featureId: "drawers" },
      ]],
      ["forms", [
        { name: "react-hook-form", version: "^7.0", purpose: "Form state management", featureId: "forms" },
        { name: "zod", version: "^3.23", purpose: "Schema validation", featureId: "forms" },
        { name: "@hookform/resolvers", version: "^3.0", purpose: "Zod resolver for react-hook-form", featureId: "forms" },
      ]],
    ]),
  };
}

function getFlutterStack(): StackConfig {
  return {
    framework: "Flutter 3",
    language: "Dart",
    styling: "Material 3",
    basePackages: [
      { name: "go_router", version: "^14.0", purpose: "Declarative routing" },
      { name: "flutter_riverpod", version: "^2.5", purpose: "State management" },
      { name: "riverpod_annotation", version: "^2.3", purpose: "Riverpod code generation" },
    ],
    featurePackages: new Map([
      ["auth", [
        { name: "supabase_flutter", version: "^2.0", purpose: "Auth + database client", featureId: "auth" },
      ]],
      ["charts", [
        { name: "fl_chart", version: "^0.69", purpose: "Charts & data visualization", featureId: "charts" },
      ]],
      ["maps", [
        { name: "google_maps_flutter", version: "^2.9", purpose: "Google Maps integration", featureId: "maps" },
      ]],
      ["commerce", [
        { name: "flutter_stripe", version: "^11.0", purpose: "Stripe payments", featureId: "commerce" },
      ]],
      ["file-upload", [
        { name: "file_picker", version: "^8.0", purpose: "File selection", featureId: "file-upload" },
      ]],
      ["video", [
        { name: "video_player", version: "^2.9", purpose: "Video playback", featureId: "video" },
      ]],
      ["image-carousel", [
        { name: "carousel_slider", version: "^5.0", purpose: "Image carousel", featureId: "image-carousel" },
      ]],
      ["calendar", [
        { name: "table_calendar", version: "^3.1", purpose: "Calendar widget", featureId: "calendar" },
      ]],
      ["notifications", [
        { name: "fluttertoast", version: "^8.2", purpose: "Toast notifications", featureId: "notifications" },
      ]],
      ["search", [
        { name: "material_floating_search_bar_2", version: "^0.5", purpose: "Search bar widget", featureId: "search" },
      ]],
    ]),
  };
}

export function selectStack(
  platform: Platform,
  features: DetectedFeature[]
): {
  framework: string;
  language: string;
  styling: string;
  packages: PackageRecommendation[];
} {
  const stack = platform === "mobile" ? getFlutterStack() : getWebStack();
  const featureIds = new Set(features.map((f) => f.id));

  const packages = [...stack.basePackages];
  const seen = new Set(packages.map((p) => p.name));

  for (const featureId of featureIds) {
    const featurePkgs = stack.featurePackages.get(featureId);
    if (featurePkgs) {
      for (const pkg of featurePkgs) {
        if (!seen.has(pkg.name)) {
          packages.push(pkg);
          seen.add(pkg.name);
        }
      }
    }
  }

  return {
    framework: stack.framework,
    language: stack.language,
    styling: stack.styling,
    packages,
  };
}
