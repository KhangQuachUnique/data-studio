import { useCallback, useEffect, useState } from "react";
import type {
  DataSourceListItem,
  DataSourcePreview,
} from "@shared/types/DataSource";
import { getErrorMessage } from "@renderer/shared/lib/getErrorMessage";
import { dataSourceApi } from "../api/dataSourceApi";

interface PreviewState {
  error: string | null;
  isLoading: boolean;
  preview: DataSourcePreview | null;
}

export function useDataSources(workspaceId: string) {
  const [dataSources, setDataSources] = useState<DataSourceListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
    loadPreview,
    previews,
  };
}
