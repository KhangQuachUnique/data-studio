import type { SqliteDatabase } from "@core/db/SqliteConnection";
import type { DatasetVersionReport } from "@shared/profile/entities";
import type {
  DatasetVersionReportRepository,
  DatasetVersionReportUpdate,
} from "../../application/DatasetVersionReportRepository";
import {
  DatasetVersionReportPersistenceMapper,
  type DatasetVersionReportRow,
} from "./DatasetVersionReportPersistenceMapper";

const datasetVersionReportColumns = `
  id,
  workspace_id,
  dataset_id,
  dataset_version_id,
  row_count,
  column_count,
  size_bytes,
  duplicate_row_count,
  duplicate_row_ratio,
  missing_cell_count,
  missing_cell_ratio,
  empty_row_count,
  empty_row_ratio,
  empty_column_count,
  quality_score,
  schema_summary_json,
  quality_issues_json,
  suggested_actions_json,
  summary_json,
  status,
  error_message,
  created_at,
  finished_at
`;

export class SqliteDatasetVersionReportRepository
  implements DatasetVersionReportRepository
{
  constructor(private readonly db: SqliteDatabase) {}

  async createReport(
    datasetVersionId: string,
    report: DatasetVersionReport,
  ): Promise<DatasetVersionReport> {
    this.db
      .prepare(
        `
      INSERT INTO dataset_profile_reports (
        id,
        workspace_id,
        dataset_id,
        dataset_version_id,
        row_count,
        column_count,
        size_bytes,
        duplicate_row_count,
        duplicate_row_ratio,
        missing_cell_count,
        missing_cell_ratio,
        empty_row_count,
        empty_row_ratio,
        empty_column_count,
        quality_score,
        schema_summary_json,
        quality_issues_json,
        suggested_actions_json,
        summary_json,
        status,
        error_message,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      )
      .run(
        report.id,
        report.workspaceId,
        report.datasetId,
        datasetVersionId,
        report.rowCount ?? null,
        report.columnCount ?? null,
        report.sizeBytes ?? null,
        report.duplicateRowCount ?? null,
        report.duplicateRowRatio ?? null,
        report.missingCellCount ?? null,
        report.missingCellRatio ?? null,
        report.emptyRowCount ?? null,
        report.emptyRowRatio ?? null,
        report.emptyColumnCount ?? null,
        report.qualityScore ?? null,
        report.schemaSummaryJson ?? null,
        report.qualityIssuesJson ?? null,
        report.suggestedActionsJson ?? null,
        report.summaryJson ?? null,
        report.status,
        report.errorMessage ?? null,
        report.createdAt,
      );

    return {
      ...report,
      datasetVersionId,
    };
  }

  async getReportByDatasetVersionId(
    datasetVersionId: string,
  ): Promise<DatasetVersionReport | null> {
    const row = this.db
      .prepare(
        `
      SELECT ${datasetVersionReportColumns}
        FROM dataset_profile_reports
        WHERE dataset_version_id = ?
        ORDER BY created_at DESC
        LIMIT 1
      `,
      )
      .get(datasetVersionId) as DatasetVersionReportRow | undefined;

    return row ? DatasetVersionReportPersistenceMapper.toEntity(row) : null;
  }

  async updateReport(
    reportId: string,
    report: DatasetVersionReportUpdate,
  ): Promise<DatasetVersionReport> {
    this.db
      .prepare(
        `
      UPDATE dataset_profile_reports
      SET
        row_count = COALESCE(?, row_count),
        column_count = COALESCE(?, column_count),
        size_bytes = COALESCE(?, size_bytes),
        duplicate_row_count = COALESCE(?, duplicate_row_count),
        duplicate_row_ratio = COALESCE(?, duplicate_row_ratio),
        missing_cell_count = COALESCE(?, missing_cell_count),
        missing_cell_ratio = COALESCE(?, missing_cell_ratio),
        empty_row_count = COALESCE(?, empty_row_count),
        empty_row_ratio = COALESCE(?, empty_row_ratio),
        empty_column_count = COALESCE(?, empty_column_count),
        quality_score = COALESCE(?, quality_score),
        schema_summary_json = COALESCE(?, schema_summary_json),
        quality_issues_json = COALESCE(?, quality_issues_json),
        suggested_actions_json = COALESCE(?, suggested_actions_json),
        summary_json = COALESCE(?, summary_json),
        status = COALESCE(?, status),
        error_message = COALESCE(?, error_message),
        finished_at = COALESCE(?, finished_at)
      WHERE id = ?
      `,
      )
      .run(
        report.rowCount ?? null,
        report.columnCount ?? null,
        report.sizeBytes ?? null,
        report.duplicateRowCount ?? null,
        report.duplicateRowRatio ?? null,
        report.missingCellCount ?? null,
        report.missingCellRatio ?? null,
        report.emptyRowCount ?? null,
        report.emptyRowRatio ?? null,
        report.emptyColumnCount ?? null,
        report.qualityScore ?? null,
        report.schemaSummaryJson ?? null,
        report.qualityIssuesJson ?? null,
        report.suggestedActionsJson ?? null,
        report.summaryJson ?? null,
        report.status ?? null,
        report.errorMessage ?? null,
        report.finishedAt ?? null,
        reportId,
      );

    const updatedReport = this.findById(reportId);

    if (!updatedReport) {
      throw new Error(`Dataset version report not found: ${reportId}`);
    }

    return updatedReport;
  }

  private findById(reportId: string): DatasetVersionReport | null {
    const row = this.db
      .prepare(
        `
        SELECT ${datasetVersionReportColumns}
        FROM dataset_profile_reports
        WHERE id = ?
        `,
      )
      .get(reportId) as DatasetVersionReportRow | undefined;

    return row ? DatasetVersionReportPersistenceMapper.toEntity(row) : null;
  }
}
