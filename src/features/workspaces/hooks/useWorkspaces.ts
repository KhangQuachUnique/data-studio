import { useCallback, useEffect, useState } from "react";
import type { CreateWorkspaceInput, Workspace } from "@shared/types/Workspace";
import { getErrorMessage } from "@renderer/shared/lib/getErrorMessage";
import { workspaceApi } from "../api/workspaceApi";

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        await workspaceApi.createWorkspace(input);
        await loadWorkspaces();
      } catch (unknownError) {
        setError(getErrorMessage(unknownError));
      } finally {
        setIsCreating(false);
      }
    },
    [loadWorkspaces],
  );

  useEffect(() => {
    void loadWorkspaces();
  }, [loadWorkspaces]);

  return {
    workspaces,
    error,
    isCreating,
    isLoading,
    createWorkspace,
    loadWorkspaces,
  };
}
