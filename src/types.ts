/**
 * Self-contained types for the MCP server package.
 * No workspace dependencies — this package must be independently publishable.
 */

export type Platform = "mobile" | "desktop" | "tablet";

export interface Dimensions {
  width: number;
  height: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface WireframeElement {
  id: string;
  type: string;
  position: Position;
  size: Size;
  properties: Record<string, unknown>;
  locked?: boolean;
  hidden?: boolean;
  zIndex?: number;
  children?: WireframeElement[];
}

export interface Connection {
  id: string;
  fromElement: string;
  trigger: string;
  action: {
    type: string;
    toScreen?: string;
    modalId?: string;
    drawerId?: string;
    transition?: string;
    [key: string]: unknown;
  };
  itemIndex?: number;
}

export interface Screen {
  id: string;
  name: string;
  screenType: string;
  order: number;
  elements: WireframeElement[];
  connections: Connection[];
  canvasWidth?: number | null;
  canvasHeight?: number | null;
}

export interface FlowNode {
  screenId: string;
  screenName?: string | null;
  [key: string]: unknown;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  [key: string]: unknown;
}

export interface Flow {
  id: string;
  name: string;
  description?: string | null;
  entryScreen: string;
  entryScreenName?: string | null;
  nodes: FlowNode[];
  edges: FlowEdge[];
  color?: string;
  createdAt: string;
}

export interface ProjectOverview {
  id: string;
  name: string;
  description?: string | null;
  platform: Platform;
  dimensions: Dimensions;
  createdAt: string;
  updatedAt: string;
  screenCount: number;
  flowCount: number;
}

export interface ProjectDetail {
  project: {
    id: string;
    name: string;
    description?: string | null;
    platform: Platform;
    dimensions: Dimensions;
    aiContext?: ProjectContext | null;
    createdAt: string;
    updatedAt: string;
  };
  screens: Array<{
    id: string;
    name: string;
    screenType: string;
    order: number;
  }>;
  flows: Array<{
    id: string;
    name: string;
    description?: string | null;
  }>;
}

export interface ProjectContext {
  appType?: string;
  audience?: string;
  features?: string[];
  brandStyle?: string;
  additionalContext?: string;
  [key: string]: unknown;
}

// Semantic transform output types
export interface SemanticElement {
  component: string;
  props: Record<string, unknown>;
  navigates_to?: string;
  children?: SemanticElement[];
}

export interface SemanticScreen {
  name: string;
  type: string;
  elements: SemanticElement[];
}
