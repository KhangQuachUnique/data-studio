export type DatasetStorageFormat = "parquet" | "csv" | "duckdb_table";

export interface DatasetVersion {
  id: string;
  workspaceId: string;
  datasetId: string;
  versionNumber: number;
  versionName?: string;
  description?: string;
  storageFormat: DatasetStorageFormat;
  storageUri: string;
  rowCount?: number;
  columnCount?: number;
  sizeBytes?: number;
  schemaJson?: string;
  createdByOperationId?: string;
  createdAt: string;
}
