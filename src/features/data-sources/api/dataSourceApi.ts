import type {
  DataSource,
  ImportCsvInput,
  ImportCsvResult,
} from "@shared/types/DataSource";

export const dataSourceApi = {
  selectCsvFile(): Promise<string | null> {
    return window.api.selectCsvFile();
  },

  listDataSources(workspaceId: string): Promise<DataSource[]> {
    return window.api.listDataSources(workspaceId);
  },

  importCsv(input: ImportCsvInput): Promise<ImportCsvResult> {
    return window.api.importCsv(input);
  },
};
