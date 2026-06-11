import type { Workspace, WorkspaceDetail } from "../entities";

export type ListWorkspacesResponseDto = Workspace[];

export type GetWorkspaceResponseDto = WorkspaceDetail;

export type GetLastOpenedWorkspaceResponseDto = Workspace | null;

export type SetLastOpenedWorkspaceResponseDto = Workspace;

export type CreateWorkspaceResponseDto = Workspace;

export type ArchiveWorkspaceResponseDto = Workspace;

export type UnarchiveWorkspaceResponseDto = Workspace;

export type OpenWorkspaceFolderResponseDto = void;
