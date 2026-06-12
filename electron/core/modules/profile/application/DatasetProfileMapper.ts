import type { DatasetVersionReportUpdate } from "./DatasetVersionReportRepository";
import type { DatasetProfileResult } from "./DatasetProfileEngineTypes";

export class DatasetProfileMapper {
  static toReportUpdate(
    result: DatasetProfileResult,
  ): DatasetVersionReportUpdate {
    return {
      columnCount: result.columnCount,
      duplicateRowCount: result.duplicateRowCount,
      duplicateRowRatio: result.duplicateRowRatio,
      emptyColumnCount: result.emptyColumnCount,
      emptyRowCount: result.emptyRowCount,
      emptyRowRatio: result.emptyRowRatio,
      missingCellCount: result.missingCellCount,
      missingCellRatio: result.missingCellRatio,
      qualityIssuesJson: result.qualityIssuesJson,
      qualityScore: result.qualityScore,
      rowCount: result.rowCount,
      schemaSummaryJson: result.schemaSummaryJson,
      sizeBytes: result.sizeBytes,
      suggestedActionsJson: result.suggestedActionsJson,
      summaryJson: result.summaryJson,
    };
  }
}
