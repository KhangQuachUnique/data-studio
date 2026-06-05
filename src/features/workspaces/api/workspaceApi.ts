import type { CreateWorkspaceInput, Workspace } from "@shared/types/Workspace";

export const workspaceApi = {
  listWorkspaces(): Promise<Workspace[]> {
    return window.api.listWorkspaces();
  },

  createWorkspace(input: CreateWorkspaceInput): Promise<Workspace> {
    return window.api.createWorkspace(input);
  },
};
