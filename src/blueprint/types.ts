export interface DetectedFeature {
  id: string;
  name: string;
  confidence: "high" | "medium";
  detectedFrom: string[];
}

export interface PackageRecommendation {
  name: string;
  version: string;
  purpose: string;
  featureId?: string;
}

export interface RouteMapping {
  screenName: string;
  screenType: "screen" | "modal" | "drawer";
  routePath: string;
  componentName: string;
  fileName: string;
  keyComponentTypes: string[];
  navigatesTo: string[];
}

export interface NavigationStructure {
  type: "tab-based" | "sidebar" | "stack" | "drawer-based" | "hybrid";
  primaryNav: string[];
  entryScreen: string;
}

export interface ProjectBlueprint {
  projectName: string;
  description: string;
  platform: "mobile" | "desktop" | "tablet";
  framework: string;
  language: string;
  styling: string;
  detectedFeatures: DetectedFeature[];
  packages: PackageRecommendation[];
  routes: RouteMapping[];
  navigation: NavigationStructure;
  directoryStructure: string;
  envVars: string[];
  setupCommands: string[];
  configNotes: string[];
}
