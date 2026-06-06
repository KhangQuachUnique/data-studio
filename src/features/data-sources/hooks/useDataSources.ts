import { useCallback, useEffect, useState } from "react";
import type { DataSource } from "@shared/types/DataSource";
import { getErrorMessage } from "@renderer/shared/lib/getErrorMessage";
import { dataSourceApi } from "../api/dataSourceApi";

export function useDataSources(workspaceId: string) {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    void loadDataSources();
  }, [loadDataSources]);

  return {
    dataSources,
    error,
    importCsv,
    isImporting,
    isLoading,
    loadDataSources,
  };
}
