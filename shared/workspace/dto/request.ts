export interface CreateWorkspaceRequestDto {
  name: string;
  description?: string;
}

export interface GetWorkspaceRequestDto {
  workspaceId: string;
}

export interface SetLastOpenedWorkspaceRequestDto {
  workspaceId: string;
}

export interface ArchiveWorkspaceRequestDto {
  workspaceId: string;
}

export interface UnarchiveWorkspaceRequestDto {
  workspaceId: string;
}

export interface OpenWorkspaceFolderRequestDto {
  workspaceId: string;
}
