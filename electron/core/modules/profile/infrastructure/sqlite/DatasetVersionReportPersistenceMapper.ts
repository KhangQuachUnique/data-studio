import type {
  DatasetVersionReport,
  ProfileReportStatus,
} from "@shared/profile/entities";
import { nullToUndefined } from "@core/lib/mapping";

export interface DatasetVersionReportRow {
  id: string;
  workspace_id: string;
  dataset_id: string;
  dataset_version_id: string;
  row_count: number | null;
  column_count: number | null;
  size_bytes: number | null;
  duplicate_row_count: number | null;
  duplicate_row_ratio: number | null;
  missing_cell_count: number | null;
  missing_cell_ratio: number | null;
  empty_row_count: number | null;
  empty_row_ratio: number | null;
  empty_column_count: number | null;
  quality_score: number | null;
  schema_summary_json: string | null;
  quality_issues_json: string | null;
  suggested_actions_json: string | null;
  summary_json: string | null;
  status: string;
  error_message: string | null;
  created_at: string;
  finished_at: string | null;
}

export class DatasetVersionReportPersistenceMapper {
  static toEntity(row: DatasetVersionReportRow): DatasetVersionReport {
    return {
      id: row.id,
      workspaceId: row.workspace_id,
      datasetId: row.dataset_id,
      datasetVersionId: row.dataset_version_id,
      rowCount: nullToUndefined(row.row_count),
      columnCount: nullToUndefined(row.column_count),
      sizeBytes: nullToUndefined(row.size_bytes),
      duplicateRowCount: nullToUndefined(row.duplicate_row_count),
      duplicateRowRatio: nullToUndefined(row.duplicate_row_ratio),
      missingCellCount: nullToUndefined(row.missing_cell_count),
      missingCellRatio: nullToUndefined(row.missing_cell_ratio),
      emptyRowCount: nullToUndefined(row.empty_row_count),
      emptyRowRatio: nullToUndefined(row.empty_row_ratio),
      emptyColumnCount: nullToUndefined(row.empty_column_count),
      qualityScore: nullToUndefined(row.quality_score),
      schemaSummaryJson: nullToUndefined(row.schema_summary_json),
      qualityIssuesJson: nullToUndefined(row.quality_issues_json),
      suggestedActionsJson: nullToUndefined(row.suggested_actions_json),
      summaryJson: nullToUndefined(row.summary_json),
      status: row.status as ProfileReportStatus,
      errorMessage: nullToUndefined(row.error_message),
      createdAt: row.created_at,
      finishedAt: nullToUndefined(row.finished_at),
    };
  }
}
