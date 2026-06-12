import { useCallback, useEffect, useState } from "react";
import type {
  DataSourceListItem,
  DataSourcePreview,
} from "@shared/data-source/entities";
import type { DatasetVersionProfileDetail } from "@shared/profile/entities";
import { getErrorMessage } from "@renderer/shared/lib/getErrorMessage";
import { dataSourceApi } from "../api/dataSourceApi";

interface PreviewState {
  error: string | null;
  isLoading: boolean;
  preview: DataSourcePreview | null;
}

interface ProfileState {
  detail: DatasetVersionProfileDetail | null;
  error: string | null;
  hasLoaded: boolean;
  isLoading: boolean;
  isRunning: boolean;
}

export function useDataSources(workspaceId: string) {
  const [dataSources, setDataSources] = useState<DataSourceListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profiles, setProfiles] = useState<Record<string, ProfileState>>({});
  const [previews, setPreviews] = useState<Record<string, PreviewState>>({});

  const loadDataSources = useCallback(async (): Promise<void> => {
    setError(null);
    setIsLoading(true);

    try {
      const nextDataSources = await dataSourceApi.listDataSources(workspaceId);
      setDataSources(nextDataSources);
    } catch (unknownError) {
      setError(getErrorMessage(unknownError));
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  const importCsv = useCallback(async (): Promise<void> => {
    setError(null);
    setIsImporting(true);

    try {
      const filePath = await dataSourceApi.selectCsvFile();

      if (!filePath) {
        return;
      }

      await dataSourceApi.importCsv({
        delimiter: ",",
        filePath,
        hasHeader: true,
        workspaceId,
      });
      await loadDataSources();
    } catch (unknownError) {
      setError(getErrorMessage(unknownError));
    } finally {
      setIsImporting(false);
    }
  }, [loadDataSources, workspaceId]);

  const loadPreview = useCallback(
    async (dataSourceId: string): Promise<void> => {
      setPreviews((current) => ({
        ...current,
        [dataSourceId]: {
          error: null,
          isLoading: true,
          preview: current[dataSourceId]?.preview ?? null,
        },
      }));

      try {
        const preview = await dataSourceApi.previewDataSource(
          workspaceId,
          dataSourceId,
          100,
        );

        setPreviews((current) => ({
          ...current,
          [dataSourceId]: {
            error: null,
            isLoading: false,
            preview,
          },
        }));
      } catch (unknownError) {
        setPreviews((current) => ({
          ...current,
          [dataSourceId]: {
            error: getErrorMessage(unknownError),
            isLoading: false,
            preview: current[dataSourceId]?.preview ?? null,
          },
        }));
      }
    },
    [workspaceId],
  );

  const deleteDataSource = useCallback(
    async (dataSourceId: string): Promise<void> => {
      setError(null);
      setDeletingIds((current) =>
        current.includes(dataSourceId) ? current : [...current, dataSourceId],
      );

      try {
        await dataSourceApi.deleteDataSource(workspaceId, dataSourceId);
        setPreviews((current) => {
          const nextPreviews = { ...current };
          delete nextPreviews[dataSourceId];
          return nextPreviews;
        });
        await loadDataSources();
      } catch (unknownError) {
        setError(getErrorMessage(unknownError));
      } finally {
        setDeletingIds((current) =>
          current.filter((currentId) => currentId !== dataSourceId),
        );
      }
    },
    [loadDataSources, workspaceId],
  );

  const loadProfile = useCallback(
    async (datasetVersionId: string): Promise<void> => {
      setProfiles((current) => ({
        ...current,
        [datasetVersionId]: {
          error: null,
          detail: current[datasetVersionId]?.detail ?? null,
          hasLoaded: current[datasetVersionId]?.hasLoaded ?? false,
          isLoading: true,
          isRunning: current[datasetVersionId]?.isRunning ?? false,
        },
      }));

      try {
        const detail = await dataSourceApi.getDatasetVersionProfileReport(
          datasetVersionId,
        );

        setProfiles((current) => ({
          ...current,
          [datasetVersionId]: {
            error: null,
            detail,
            hasLoaded: true,
            isLoading: false,
            isRunning: false,
          },
        }));
      } catch (unknownError) {
        setProfiles((current) => ({
          ...current,
          [datasetVersionId]: {
            error: getErrorMessage(unknownError),
            detail: current[datasetVersionId]?.detail ?? null,
            hasLoaded: true,
            isLoading: false,
            isRunning: false,
          },
        }));
      }
    },
    [],
  );

  const runProfile = useCallback(
    async (datasetVersionId: string): Promise<void> => {
      setProfiles((current) => ({
        ...current,
        [datasetVersionId]: {
          error: null,
          detail: current[datasetVersionId]?.detail ?? null,
          hasLoaded: current[datasetVersionId]?.hasLoaded ?? false,
          isLoading: false,
          isRunning: true,
        },
      }));

      try {
        const detail = await dataSourceApi.runDatasetVersionProfile(
          datasetVersionId,
        );

        setProfiles((current) => ({
          ...current,
          [datasetVersionId]: {
            error: null,
            detail,
            hasLoaded: true,
            isLoading: false,
            isRunning: false,
          },
        }));
      } catch (unknownError) {
        setProfiles((current) => ({
          ...current,
          [datasetVersionId]: {
            error: getErrorMessage(unknownError),
            detail: current[datasetVersionId]?.detail ?? null,
            hasLoaded: true,
            isLoading: false,
            isRunning: false,
          },
        }));
      }
    },
    [],
  );

  useEffect(() => {
    void loadDataSources();
  }, [loadDataSources]);

  return {
    dataSources,
    deleteDataSource,
    deletingIds,
    error,
    importCsv,
    isImporting,
    isLoading,
    loadDataSources,
    loadProfile,
    loadPreview,
    profiles,
    previews,
    runProfile,
  };
}
