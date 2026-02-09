import type {
  ProjectOverview,
  ProjectDetail,
  Screen,
  Flow,
  ProjectContext,
} from "./types.js";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export class WaiframeApiClient {
  private baseUrl: string;
  private apiKey: string;
  private cache = new Map<string, CacheEntry<unknown>>();

  constructor(apiKey: string, baseUrl = "https://waiframe.ai") {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  private async request<T>(path: string, useCache = true): Promise<T> {
    const url = `${this.baseUrl}/api/mcp${path}`;

    // Check cache
    if (useCache) {
      const cached = this.cache.get(url);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data as T;
      }
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Invalid API key. Generate a new key at waiframe.ai/app/settings?tab=api-keys");
      }
      if (response.status === 404) {
        throw new Error("Resource not found");
      }
      const body = await response.text();
      throw new Error(`API error (${response.status}): ${body}`);
    }

    const data = await response.json() as T;

    // Update cache
    this.cache.set(url, { data, timestamp: Date.now() });

    return data;
  }

  async listProjects(): Promise<ProjectOverview[]> {
    const result = await this.request<{ projects: ProjectOverview[] }>("/projects");
    return result.projects;
  }

  async getProjectOverview(projectId: string): Promise<ProjectDetail> {
    return this.request<ProjectDetail>(`/projects/${projectId}`);
  }

  async getScreens(projectId: string): Promise<Screen[]> {
    const result = await this.request<{ screens: Screen[] }>(`/projects/${projectId}/screens`);
    return result.screens;
  }

  async getScreen(projectId: string, screenId: string): Promise<Screen> {
    const result = await this.request<{ screen: Screen }>(`/projects/${projectId}/screens/${screenId}`);
    return result.screen;
  }

  async getFlows(projectId: string): Promise<Flow[]> {
    const result = await this.request<{ flows: Flow[] }>(`/projects/${projectId}/flows`);
    return result.flows;
  }

  async getContext(projectId: string): Promise<{ project: { name: string; description?: string | null; platform: string; dimensions: { width: number; height: number } }; context: ProjectContext | null }> {
    return this.request(`/projects/${projectId}/context`);
  }

  clearCache(): void {
    this.cache.clear();
  }
}
