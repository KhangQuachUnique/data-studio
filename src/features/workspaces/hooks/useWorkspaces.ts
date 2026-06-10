import { useCallback, useEffect, useState } from "react";
import type {
  CreateWorkspaceInput,
  Workspace,
  WorkspaceDetail,
} from "@shared/types/Workspace";
import { getErrorMessage } from "@renderer/shared/lib/getErrorMessage";
import { workspaceApi } from "../api/workspaceApi";

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedWorkspaceDetail, setSelectedWorkspaceDetail] =
    useState<WorkspaceDetail | null>(null);
  const [isRestoringLastWorkspace, setIsRestoringLastWorkspace] =
    useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWorkspaceDetail = useCallback(
    async (workspaceId: string): Promise<WorkspaceDetail | null> => {
      try {
        const detail = await workspaceApi.getWorkspace(workspaceId);
        setSelectedWorkspaceDetail(detail);
        return detail;
      } catch (unknownError) {
        setError(getErrorMessage(unknownError));
        return null;
      }
    },
    [],
  );

  const loadWorkspaces = useCallback(async (): Promise<void> => {
    setError(null);
    setIsLoading(true);

    try {
      const nextWorkspaces = await workspaceApi.listWorkspaces();
      setWorkspaces(nextWorkspaces);
    } catch (unknownError) {
      setError(getErrorMessage(unknownError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createWorkspace = useCallback(
    async (input: CreateWorkspaceInput): Promise<void> => {
      setError(null);
      setIsCreating(true);

      try {
        const workspace = await workspaceApi.createWorkspace(input);
        await workspaceApi.setLastOpenedWorkspace(workspace.id);
        await loadWorkspaceDetail(workspace.id);
        await loadWorkspaces();
      } catch (unknownError) {
        setError(getErrorMessage(unknownError));
      } finally {
        setIsCreating(false);
      }
    },
    [loadWorkspaceDetail, loadWorkspaces],
  );

  const openWorkspace = useCallback(
    async (workspaceId: string): Promise<void> => {
      setError(null);

      try {
        await workspaceApi.setLastOpenedWorkspace(workspaceId);
        await loadWorkspaceDetail(workspaceId);
      } catch (unknownError) {
        setError(getErrorMessage(unknownError));
      }
    },
    [loadWorkspaceDetail],
  );

  const closeWorkspace = useCallback((): void => {
    setSelectedWorkspaceDetail(null);
  }, []);

  const archiveWorkspace = useCallback(
    async (workspaceId: string): Promise<void> => {
      setError(null);

      try {
        const workspace = await workspaceApi.archiveWorkspace(workspaceId);
        if (selectedWorkspaceDetail?.workspace.id === workspace.id) {
          await loadWorkspaceDetail(workspace.id);
        }
        await loadWorkspaces();
      } catch (unknownError) {
        setError(getErrorMessage(unknownError));
      }
    },
    [loadWorkspaceDetail, loadWorkspaces, selectedWorkspaceDetail],
  );

  const unarchiveWorkspace = useCallback(
    async (workspaceId: string): Promise<void> => {
      setError(null);

      try {
        const workspace = await workspaceApi.unarchiveWorkspace(workspaceId);
        if (selectedWorkspaceDetail?.workspace.id === workspace.id) {
          await loadWorkspaceDetail(workspace.id);
        }
        await loadWorkspaces();
      } catch (unknownError) {
        setError(getErrorMessage(unknownError));
      }
    },
    [loadWorkspaceDetail, loadWorkspaces, selectedWorkspaceDetail],
  );

  const openWorkspaceFolder = useCallback(
    async (workspaceId: string): Promise<void> => {
      setError(null);

      try {
        await workspaceApi.openWorkspaceFolder(workspaceId);
      } catch (unknownError) {
        setError(getErrorMessage(unknownError));
      }
    },
    [],
  );

  useEffect(() => {
    void (async () => {
      try {
        await loadWorkspaces();
        const lastOpenedWorkspace = await workspaceApi.getLastOpenedWorkspace();

        if (lastOpenedWorkspace) {
          await loadWorkspaceDetail(lastOpenedWorkspace.id);
        }
      } finally {
        setIsRestoringLastWorkspace(false);
      }
    })();
  }, [loadWorkspaceDetail, loadWorkspaces]);

  return {
    workspaces,
    selectedWorkspaceDetail,
    error,
    isCreating,
    isLoading,
    isRestoringLastWorkspace,
    archiveWorkspace,
    closeWorkspace,
    createWorkspace,
    loadWorkspaceDetail,
    loadWorkspaces,
    openWorkspace,
    openWorkspaceFolder,
    unarchiveWorkspace,
  };
}
