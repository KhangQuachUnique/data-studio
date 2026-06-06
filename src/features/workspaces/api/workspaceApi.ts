import type {
  CreateWorkspaceInput,
  Workspace,
  WorkspaceDetail,
} from "@shared/types/Workspace";

export const workspaceApi = {
  listWorkspaces(): Promise<Workspace[]> {
    return window.api.listWorkspaces();
  },

  getWorkspace(workspaceId: string): Promise<WorkspaceDetail> {
    return window.api.getWorkspace(workspaceId);
  },

  getLastOpenedWorkspace(): Promise<Workspace | null> {
    return window.api.getLastOpenedWorkspace();
  },

  setLastOpenedWorkspace(workspaceId: string): Promise<Workspace> {
    return window.api.setLastOpenedWorkspace(workspaceId);
  },

  createWorkspace(input: CreateWorkspaceInput): Promise<Workspace> {
    return window.api.createWorkspace(input);
  },

  archiveWorkspace(workspaceId: string): Promise<Workspace> {
    return window.api.archiveWorkspace(workspaceId);
  },

  unarchiveWorkspace(workspaceId: string): Promise<Workspace> {
    return window.api.unarchiveWorkspace(workspaceId);
  },

  openWorkspaceFolder(workspaceId: string): Promise<void> {
    return window.api.openWorkspaceFolder(workspaceId);
  },
};
