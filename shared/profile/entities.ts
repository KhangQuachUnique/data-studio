import type { DataSource } from "@shared/data-source/entities";
import type { Dataset } from "@shared/dataset/entities";
import type { DatasetVersion } from "@shared/dataset-version/entities";

export type ProfileReportStatus = "pending" | "running" | "success" | "failed";

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

export type DatasetVersionReport = DatasetProfileReport;

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

export interface DataSourceProfileDetail {
  dataSource: DataSource;
  dataset?: Dataset;
  currentVersion?: DatasetVersion;
  profileReport?: DatasetProfileReport;
  columnReports: ColumnProfileReport[];
}
