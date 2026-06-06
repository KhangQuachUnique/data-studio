export type DataSourceType = "CSV";

export type DataSourceStatus = "PENDING" | "READY" | "FAILED";

export type ProfileStatus = "NOT_STARTED" | "PENDING" | "READY" | "FAILED";

export type DatasetVersionSourceKind = "IMPORT" | "TRANSFORM";

export type DatasetVersionStatus = "PENDING" | "READY" | "FAILED";

export type ProfileReportStatus = "PENDING" | "READY" | "FAILED";

export type InferredColumnType =
  | "STRING"
  | "INTEGER"
  | "FLOAT"
  | "BOOLEAN"
  | "DATE"
  | "DATETIME"
  | "UNKNOWN";

export interface DataSource {
  id: string;
  workspaceId: string;
  name: string;
  type: DataSourceType;
  originalPath?: string;
  storedPath?: string;
  tableName?: string;
  status: DataSourceStatus;
  errorMessage?: string;
  fileSizeBytes?: number;
  detectedEncoding?: string;
  delimiter?: string;
  hasHeader: boolean;
  rowCount?: number;
  columnCount?: number;
  profileStatus: ProfileStatus;
  profiledAt?: string;
  currentVersionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DatasetVersion {
  id: string;
  workspaceId: string;
  dataSourceId: string;
  versionNumber: number;
  sourceKind: DatasetVersionSourceKind;
  parentVersionId?: string;
  tableName: string;
  rowCount?: number;
  columnCount?: number;
  status: DatasetVersionStatus;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DatasetProfileReport {
  id: string;
  workspaceId: string;
  dataSourceId: string;
  datasetVersionId: string;
  status: ProfileReportStatus;
  rowCount?: number;
  columnCount?: number;
  duplicateRowCount?: number;
  missingCellCount?: number;
  missingCellPercent?: number;
  qualityScore?: number;
  reportPath?: string;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

export interface ColumnProfileReport {
  id: string;
  profileReportId: string;
  columnName: string;
  columnIndex: number;
  inferredType: InferredColumnType;
  nonNullCount?: number;
  nullCount?: number;
  nullPercent?: number;
  distinctCount?: number;
  uniqueCount?: number;
  minValue?: string;
  maxValue?: string;
  meanValue?: number;
  medianValue?: number;
  stddevValue?: number;
  minLength?: number;
  maxLength?: number;
  avgLength?: number;
  sampleValuesJson?: string;
  warningsJson?: string;
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
  currentVersion: DatasetVersion;
}

export interface DataSourceProfileDetail {
  dataSource: DataSource;
  currentVersion?: DatasetVersion;
  profileReport?: DatasetProfileReport;
  columnReports: ColumnProfileReport[];
}
