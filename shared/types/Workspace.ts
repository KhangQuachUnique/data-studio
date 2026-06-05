export type WorkspaceStatus = "ACTIVE" | "ARCHIVED";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  path: string;
  duckdbPath: string;
  status: WorkspaceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkspaceInput {
  name: string;
  description?: string;
}
