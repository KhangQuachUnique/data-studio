import type { SqliteDatabase } from "@core/db/SqliteConnection";
import { nullToUndefined } from "@core/lib/mapping";
import type { ColumnProfileReport } from "@shared/profile/entities";
import type { ColumnProfileReportRepository } from "../../application/ColumnProfileReportRepository";

export class SqliteColumnProfileReportRepository
  implements ColumnProfileReportRepository
{
  constructor(private readonly db: SqliteDatabase) {}

  async createMany(
    reports: ColumnProfileReport[],
  ): Promise<ColumnProfileReport[]> {
    const insert = this.db.prepare(
      `
      INSERT INTO column_profile_reports (
        id,
        profile_report_id,
        dataset_version_id,
        dataset_version_column_id,
        column_name,
        ordinal_position,
        declared_type,
        inferred_type,
        row_count,
        non_null_count,
        null_count,
        null_ratio,
        empty_string_count,
        empty_string_ratio,
        unique_count,
        unique_ratio,
        min_value,
        max_value,
        mean_value,
        median_value,
        std_value,
        q1_value,
        q3_value,
        min_length,
        max_length,
        avg_length,
        top_values_json,
        sample_values_json,
        issues_json,
        stats_json,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    );

    const transaction = this.db.transaction((nextReports: ColumnProfileReport[]) => {
      for (const report of nextReports) {
        insert.run(
          report.id,
          report.profileReportId,
          report.datasetVersionId,
          report.datasetVersionColumnId,
          report.columnName,
          report.ordinalPosition,
          report.declaredType ?? null,
          report.inferredType ?? null,
          report.rowCount ?? null,
          report.nonNullCount ?? null,
          report.nullCount ?? null,
          report.nullRatio ?? null,
          report.emptyStringCount ?? null,
          report.emptyStringRatio ?? null,
          report.uniqueCount ?? null,
          report.uniqueRatio ?? null,
          report.minValue ?? null,
          report.maxValue ?? null,
          report.meanValue ?? null,
          report.medianValue ?? null,
          report.stdValue ?? null,
          report.q1Value ?? null,
          report.q3Value ?? null,
          report.minLength ?? null,
          report.maxLength ?? null,
          report.avgLength ?? null,
          report.topValuesJson ?? null,
          report.sampleValuesJson ?? null,
          report.issuesJson ?? null,
          report.statsJson ?? null,
          report.createdAt,
        );
      }
    });

    transaction(reports);

    return reports;
  }

  async findByProfileReportId(
    profileReportId: string,
  ): Promise<ColumnProfileReport[]> {
    const rows = this.db
      .prepare(
        `
        SELECT
          id,
          profile_report_id,
          dataset_version_id,
          dataset_version_column_id,
          column_name,
          ordinal_position,
          declared_type,
          inferred_type,
          row_count,
          non_null_count,
          null_count,
          null_ratio,
          empty_string_count,
          empty_string_ratio,
          unique_count,
          unique_ratio,
          min_value,
          max_value,
          mean_value,
          median_value,
          std_value,
          q1_value,
          q3_value,
          min_length,
          max_length,
          avg_length,
          top_values_json,
          sample_values_json,
          issues_json,
          stats_json,
          created_at
        FROM column_profile_reports
        WHERE profile_report_id = ?
        ORDER BY ordinal_position ASC
        `,
      )
      .all(profileReportId) as ColumnProfileReportRow[];

    return rows.map(toColumnProfileReport);
  }
}

interface ColumnProfileReportRow {
  id: string;
  profile_report_id: string;
  dataset_version_id: string;
  dataset_version_column_id: string;
  column_name: string;
  ordinal_position: number;
  declared_type: string | null;
  inferred_type: string | null;
  row_count: number | null;
  non_null_count: number | null;
  null_count: number | null;
  null_ratio: number | null;
  empty_string_count: number | null;
  empty_string_ratio: number | null;
  unique_count: number | null;
  unique_ratio: number | null;
  min_value: string | null;
  max_value: string | null;
  mean_value: number | null;
  median_value: number | null;
  std_value: number | null;
  q1_value: number | null;
  q3_value: number | null;
  min_length: number | null;
  max_length: number | null;
  avg_length: number | null;
  top_values_json: string | null;
  sample_values_json: string | null;
  issues_json: string | null;
  stats_json: string | null;
  created_at: string;
}

function toColumnProfileReport(row: ColumnProfileReportRow): ColumnProfileReport {
  return {
    id: row.id,
    avgLength: nullToUndefined(row.avg_length),
    columnName: row.column_name,
    createdAt: row.created_at,
    datasetVersionColumnId: row.dataset_version_column_id,
    datasetVersionId: row.dataset_version_id,
    declaredType: nullToUndefined(row.declared_type),
    emptyStringCount: nullToUndefined(row.empty_string_count),
    emptyStringRatio: nullToUndefined(row.empty_string_ratio),
    inferredType: nullToUndefined(row.inferred_type),
    issuesJson: nullToUndefined(row.issues_json),
    maxLength: nullToUndefined(row.max_length),
    maxValue: nullToUndefined(row.max_value),
    meanValue: nullToUndefined(row.mean_value),
    medianValue: nullToUndefined(row.median_value),
    minLength: nullToUndefined(row.min_length),
    minValue: nullToUndefined(row.min_value),
    nonNullCount: nullToUndefined(row.non_null_count),
    nullCount: nullToUndefined(row.null_count),
    nullRatio: nullToUndefined(row.null_ratio),
    ordinalPosition: row.ordinal_position,
    profileReportId: row.profile_report_id,
    q1Value: nullToUndefined(row.q1_value),
    q3Value: nullToUndefined(row.q3_value),
    rowCount: nullToUndefined(row.row_count),
    sampleValuesJson: nullToUndefined(row.sample_values_json),
    statsJson: nullToUndefined(row.stats_json),
    stdValue: nullToUndefined(row.std_value),
    topValuesJson: nullToUndefined(row.top_values_json),
    uniqueCount: nullToUndefined(row.unique_count),
    uniqueRatio: nullToUndefined(row.unique_ratio),
  };
}
