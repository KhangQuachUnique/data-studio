import type {
  DataSourceListItem,
  DataSourcePreview,
} from "@shared/data-source/entities";
import type { ImportCsvInput, ImportCsvResult } from "@shared/data-source/dtos";

export const dataSourceApi = {
  selectCsvFile(): Promise<string | null> {
    return window.api.selectCsvFile();
  },

  listDataSources(workspaceId: string): Promise<DataSourceListItem[]> {
    return window.api.listDataSources(workspaceId);
  },

  importCsv(input: ImportCsvInput): Promise<ImportCsvResult> {
    return window.api.importCsv(input);
  },

  previewDataSource(
    workspaceId: string,
    dataSourceId: string,
    rowLimit?: number,
  ): Promise<DataSourcePreview> {
    return window.api.previewDataSource(workspaceId, dataSourceId, rowLimit);
  },

  deleteDataSource(workspaceId: string, dataSourceId: string): Promise<void> {
    return window.api.deleteDataSource(workspaceId, dataSourceId);
  },
};
