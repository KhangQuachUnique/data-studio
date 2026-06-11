import type { DatasetVersionReport } from "@shared/profile/entities";

export type DatasetVersionReportUpdate = Partial<
  Pick<
    DatasetVersionReport,
    | "rowCount"
    | "columnCount"
    | "sizeBytes"
    | "duplicateRowCount"
    | "duplicateRowRatio"
    | "missingCellCount"
    | "missingCellRatio"
    | "emptyRowCount"
    | "emptyRowRatio"
    | "emptyColumnCount"
    | "qualityScore"
    | "schemaSummaryJson"
    | "qualityIssuesJson"
    | "suggestedActionsJson"
    | "summaryJson"
    | "status"
    | "errorMessage"
    | "finishedAt"
  >
>;

export interface DatasetVersionReportRepository {
  createReport(
    datasetVersionId: string,
    report: DatasetVersionReport,
  ): Promise<DatasetVersionReport>;

  updateReport(
    reportId: string,
    report: DatasetVersionReportUpdate,
  ): Promise<DatasetVersionReport>;

  getReportByDatasetVersionId(
    datasetVersionId: string,
  ): Promise<DatasetVersionReport | null>;
}
