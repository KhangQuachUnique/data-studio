import type { DatasetStorageFormat } from "@shared/dataset-version/entities";

export interface DatasetProfileInput {
  storageFormat: DatasetStorageFormat;
  storagePath: string;
}

export interface DatasetProfileColumnResult {
  columnName: string;
  ordinalPosition: number;
  declaredType?: string;
  inferredType?: string;
  rowCount: number;
  nonNullCount: number;
  nullCount: number;
  nullRatio: number;
  emptyStringCount?: number;
  emptyStringRatio?: number;
  uniqueCount?: number;
  uniqueRatio?: number;
  minValue?: string;
  maxValue?: string;
  topValuesJson?: string;
  sampleValuesJson?: string;
  issuesJson?: string;
  statsJson?: string;
}

export interface DatasetProfileResult {
  rowCount: number;
  columnCount: number;
  sizeBytes: number;
  duplicateRowCount: number;
  duplicateRowRatio: number;
  missingCellCount: number;
  missingCellRatio: number;
  emptyRowCount: number;
  emptyRowRatio: number;
  emptyColumnCount: number;
  qualityScore: number;
  schemaSummaryJson: string;
  qualityIssuesJson: string;
  suggestedActionsJson: string;
  summaryJson: string;
  columns: DatasetProfileColumnResult[];
}
