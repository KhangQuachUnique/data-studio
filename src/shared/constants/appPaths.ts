export const workspaceTabs = ["overview", "data-sources"] as const;

export type WorkspaceTab = (typeof workspaceTabs)[number];

export const appPathPatterns = {
  home: "/",
  workspace: "/workspaces/:workspaceId",
  workspaceTab: "/workspaces/:workspaceId/:workspaceTab",
} as const;

export const appPaths = {
  home(): string {
    return "/";
  },

  workspace(workspaceId: string): string {
    return `/workspaces/${workspaceId}`;
  },

  workspaceTab(workspaceId: string, tab: WorkspaceTab): string {
    return `/workspaces/${workspaceId}/${tab}`;
  },

  workspaceOverview(workspaceId: string): string {
    return this.workspaceTab(workspaceId, "overview");
  },

  workspaceDataSources(workspaceId: string): string {
    return this.workspaceTab(workspaceId, "data-sources");
  },
};

export function isWorkspaceTab(value: string | undefined): value is WorkspaceTab {
  return workspaceTabs.includes(value as WorkspaceTab);
}
