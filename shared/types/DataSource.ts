export type DataSourceType = "file" | "folder" | "database" | "api" | "manual";

export type DataSourceProvider =
  | "local"
  | "postgres"
  | "mysql"
  | "api"
  | "google_sheet";

export type DatasetKind = "raw" | "derived" | "cleaned" | "joined" | "aggregated";

export type DatasetStatus = "active" | "archived" | "deleted";

export type DatasetStorageFormat = "parquet" | "csv" | "duckdb_table";

export type ProfileReportStatus = "pending" | "running" | "success" | "failed";

export type OperationType = "import" | "profile" | "clean" | "export" | "transform";

export type OperationStatus =
  | "pending"
  | "running"
  | "success"
  | "failed"
  | "canceled";

export interface DataSource {
  id: string;
  workspaceId: string;
  name: string;
  sourceType: DataSourceType;
  sourceUri?: string;
  provider?: DataSourceProvider;
  configJson?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Dataset {
  id: string;
  workspaceId: string;
  sourceId?: string;
  name: string;
  displayName?: string;
  description?: string;
  datasetKind: DatasetKind;
  status: DatasetStatus;
  currentVersionId?: string;
  createdAt: string;
  updatedAt: string;
}

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

export interface DatasetVersionColumn {
  id: string;
  datasetVersionId: string;
  columnName: string;
  ordinalPosition: number;
  dataType: string;
  nullable?: boolean;
  originalColumnName?: string;
  createdAt: string;
}

export interface DataSourceListItem {
  dataSource: DataSource;
  dataset?: Dataset;
  currentVersion?: DatasetVersion;
  versionCount: number;
}

export interface DatasetProfileReport {
  id: string;
  workspaceId: string;
  datasetId: string;
  datasetVersionId: string;
  rowCount?: number;
  columnCount?: number;
  sizeBytes?: number;
  duplicateRowCount?: number;
  duplicateRowRatio?: number;
  missingCellCount?: number;
  missingCellRatio?: number;
  emptyRowCount?: number;
  emptyRowRatio?: number;
  emptyColumnCount?: number;
  qualityScore?: number;
  schemaSummaryJson?: string;
  qualityIssuesJson?: string;
  suggestedActionsJson?: string;
  summaryJson?: string;
  status: ProfileReportStatus;
  errorMessage?: string;
  createdAt: string;
  finishedAt?: string;
}

export interface ColumnProfileReport {
  id: string;
  profileReportId: string;
  datasetVersionId: string;
  datasetVersionColumnId: string;
  columnName: string;
  ordinalPosition: number;
  declaredType?: string;
  inferredType?: string;
  rowCount?: number;
  nonNullCount?: number;
  nullCount?: number;
  nullRatio?: number;
  emptyStringCount?: number;
  emptyStringRatio?: number;
  uniqueCount?: number;
  uniqueRatio?: number;
  minValue?: string;
  maxValue?: string;
  meanValue?: number;
  medianValue?: number;
  stdValue?: number;
  q1Value?: number;
  q3Value?: number;
  minLength?: number;
  maxLength?: number;
  avgLength?: number;
  topValuesJson?: string;
  sampleValuesJson?: string;
  issuesJson?: string;
  statsJson?: string;
  createdAt: string;
}

export interface Operation {
  id: string;
  workspaceId: string;
  operationType: OperationType;
  status: OperationStatus;
  sourceId?: string;
  inputVersionId?: string;
  outputVersionId?: string;
  outputProfileReportId?: string;
  engineType?: string;
  name?: string;
  description?: string;
  configJson?: string;
  resultJson?: string;
  errorMessage?: string;
  startedAt?: string;
  finishedAt?: string;
  createdAt: string;
}

export interface ImportCsvInput {
  workspaceId: string;
  filePath: string;
  hasHeader: boolean;
  delimiter?: string;
}

export interface ImportCsvResult {
  dataSource: DataSource;
  dataset: Dataset;
  currentVersion: DatasetVersion;
}

export interface DataSourcePreview {
  columns: string[];
  rows: Record<string, unknown>[];
  rowLimit: number;
}

export interface DataSourceProfileDetail {
  dataSource: DataSource;
  dataset?: Dataset;
  currentVersion?: DatasetVersion;
  profileReport?: DatasetProfileReport;
  columnReports: ColumnProfileReport[];
}
