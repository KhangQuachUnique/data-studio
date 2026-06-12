import fs from "node:fs/promises";
import path from "node:path";
import { DuckDBInstance } from "@duckdb/node-api";
import type { DatasetProfileEngine } from "../../application/DatasetProfileEngine";
import type {
  DatasetProfileColumnResult,
  DatasetProfileInput,
  DatasetProfileResult,
} from "../../application/DatasetProfileEngineTypes";

type DuckDbConnection = Awaited<ReturnType<DuckDBInstance["connect"]>>;

interface ColumnSchema {
  name: string;
  dataType: string;
  ordinalPosition: number;
}

interface DatasetAggregateRow {
  duplicate_row_count?: unknown;
  missing_cell_count?: unknown;
  empty_row_count?: unknown;
  empty_column_count?: unknown;
}

interface ColumnAggregateRow {
  row_count?: unknown;
  non_null_count?: unknown;
  non_missing_count?: unknown;
  null_count?: unknown;
  empty_string_count?: unknown;
  unique_count?: unknown;
  min_value?: unknown;
  max_value?: unknown;
  numeric_count?: unknown;
  numeric_min_value?: unknown;
  numeric_max_value?: unknown;
}

export class DuckDbProfileEngine implements DatasetProfileEngine {
  async profileDataset(
    input: DatasetProfileInput,
  ): Promise<DatasetProfileResult> {
    if (input.storageFormat !== "parquet") {
      throw new Error(`Unsupported profile storage format: ${input.storageFormat}`);
    }

    const instance = await this.withDuckDbStage("open profile engine", () =>
      DuckDBInstance.create(":memory:"),
    );
    const connection = await this.withDuckDbStage("connect profile engine", () =>
      instance.connect(),
    );

    try {
      return await this.profileParquetOnConnection(
        connection,
        input.storagePath,
      );
    } finally {
      connection.closeSync();
      instance.closeSync();
    }
  }

  private async profileParquetOnConnection(
    connection: DuckDbConnection,
    parquetPath: string,
  ): Promise<DatasetProfileResult> {
    const columns = await this.inspectColumns(connection, parquetPath);
    const rowCount = await this.countRows(connection, parquetPath);
    const fileStat = await fs.stat(parquetPath);
    const aggregates = await this.readDatasetAggregates(
      connection,
      parquetPath,
      columns,
    );
    const columnProfiles = await this.profileColumns(
      connection,
      parquetPath,
      columns,
      rowCount,
    );
    const totalCellCount = rowCount * columns.length;
    const duplicateRowCount = this.toNumber(aggregates.duplicate_row_count);
    const missingCellCount = this.toNumber(aggregates.missing_cell_count);
    const emptyRowCount = this.toNumber(aggregates.empty_row_count);
    const emptyColumnCount = this.toNumber(aggregates.empty_column_count);
    const duplicateRowRatio = this.ratio(duplicateRowCount, rowCount);
    const missingCellRatio = this.ratio(missingCellCount, totalCellCount);
    const emptyRowRatio = this.ratio(emptyRowCount, rowCount);
    const qualityIssues = this.buildQualityIssues({
      duplicateRowRatio,
      emptyColumnCount,
      emptyRowRatio,
      missingCellRatio,
    });
    const suggestedActions = this.buildSuggestedActions(qualityIssues);
    const qualityScore = this.calculateQualityScore({
      duplicateRowRatio,
      emptyColumnCount,
      emptyRowRatio,
      missingCellRatio,
    });

    return {
      columnCount: columns.length,
      columns: columnProfiles,
      duplicateRowCount,
      duplicateRowRatio,
      emptyColumnCount,
      emptyRowCount,
      emptyRowRatio,
      missingCellCount,
      missingCellRatio,
      qualityIssuesJson: JSON.stringify(qualityIssues),
      qualityScore,
      rowCount,
      schemaSummaryJson: JSON.stringify({ columns }),
      sizeBytes: fileStat.size,
      suggestedActionsJson: JSON.stringify(suggestedActions),
      summaryJson: JSON.stringify({
        columnCount: columns.length,
        duplicateRowCount,
        emptyColumnCount,
        emptyRowCount,
        missingCellCount,
        qualityScore,
        rowCount,
        sizeBytes: fileStat.size,
      }),
    };
  }

  private async inspectColumns(
    connection: DuckDbConnection,
    parquetPath: string,
  ): Promise<ColumnSchema[]> {
    const reader = await connection.runAndReadAll(
      `
      DESCRIBE SELECT *
      FROM ${this.readParquetSql(parquetPath)}
      `,
    );
    const rows = reader.getRowObjectsJson() as Array<{
      column_name?: unknown;
      column_type?: unknown;
    }>;

    return rows.map((row, index) => ({
      dataType: String(row.column_type ?? "UNKNOWN"),
      name: String(row.column_name ?? `column_${index + 1}`),
      ordinalPosition: index + 1,
    }));
  }

  private async countRows(
    connection: DuckDbConnection,
    parquetPath: string,
  ): Promise<number> {
    const reader = await connection.runAndReadAll(
      `
      SELECT count(*) AS row_count
      FROM ${this.readParquetSql(parquetPath)}
      `,
    );

    return Number(reader.getRowsJS()[0]?.[0] ?? 0);
  }

  private async readDatasetAggregates(
    connection: DuckDbConnection,
    parquetPath: string,
    columns: ColumnSchema[],
  ): Promise<DatasetAggregateRow> {
    if (columns.length === 0) {
      return {
        duplicate_row_count: 0,
        empty_column_count: 0,
        empty_row_count: 0,
        missing_cell_count: 0,
      };
    }

    const duplicateReader = await connection.runAndReadAll(
      `
      SELECT COALESCE(SUM(row_count - 1), 0) AS duplicate_row_count
      FROM (
        SELECT count(*) AS row_count
        FROM ${this.readParquetSql(parquetPath)}
        GROUP BY ${columns.map((column) => this.sqlIdentifier(column.name)).join(", ")}
        HAVING count(*) > 1
      )
      `,
    );
    const qualityReader = await connection.runAndReadAll(
      `
      SELECT
        ${columns
          .map((column) => `SUM(CASE WHEN ${this.isMissingSql(column)} THEN 1 ELSE 0 END)`)
          .join(" + ")} AS missing_cell_count,
        SUM(CASE WHEN ${columns.map((column) => this.isMissingSql(column)).join(" AND ")} THEN 1 ELSE 0 END) AS empty_row_count,
        ${columns
          .map((column) => `CASE WHEN SUM(CASE WHEN NOT (${this.isMissingSql(column)}) THEN 1 ELSE 0 END) = 0 THEN 1 ELSE 0 END`)
          .join(" + ")} AS empty_column_count
      FROM ${this.readParquetSql(parquetPath)}
      `,
    );

    return {
      ...(qualityReader.getRowObjectsJson()[0] as DatasetAggregateRow),
      duplicate_row_count: duplicateReader.getRowsJS()[0]?.[0] ?? 0,
    };
  }

  private async profileColumns(
    connection: DuckDbConnection,
    parquetPath: string,
    columns: ColumnSchema[],
    rowCount: number,
  ): Promise<DatasetProfileColumnResult[]> {
    const profiles: DatasetProfileColumnResult[] = [];

    for (const column of columns) {
      profiles.push(
        await this.profileColumn(connection, parquetPath, column, rowCount),
      );
    }

    return profiles;
  }

  private async profileColumn(
    connection: DuckDbConnection,
    parquetPath: string,
    column: ColumnSchema,
    rowCount: number,
  ): Promise<DatasetProfileColumnResult> {
    const columnSql = this.sqlIdentifier(column.name);
    const numericSql = `TRY_CAST(${this.normalizedTextValueSql(columnSql)} AS DOUBLE)`;
    const reader = await connection.runAndReadAll(
      `
      SELECT
        count(*) AS row_count,
        SUM(CASE WHEN ${columnSql} IS NOT NULL THEN 1 ELSE 0 END) AS non_null_count,
        SUM(CASE WHEN ${this.isPresentSql(column)} THEN 1 ELSE 0 END) AS non_missing_count,
        SUM(CASE WHEN ${columnSql} IS NULL THEN 1 ELSE 0 END) AS null_count,
        ${this.isTextColumn(column) ? `SUM(CASE WHEN ${columnSql} = '' THEN 1 ELSE 0 END)` : "0"} AS empty_string_count,
        count(DISTINCT ${columnSql}) AS unique_count,
        CAST(min(${columnSql}) AS VARCHAR) AS min_value,
        CAST(max(${columnSql}) AS VARCHAR) AS max_value,
        ${this.isTextColumn(column) ? `SUM(CASE WHEN ${numericSql} IS NOT NULL THEN 1 ELSE 0 END)` : "0"} AS numeric_count,
        ${this.isTextColumn(column) ? `min(${numericSql})` : "NULL"} AS numeric_min_value,
        ${this.isTextColumn(column) ? `max(${numericSql})` : "NULL"} AS numeric_max_value
      FROM ${this.readParquetSql(parquetPath)}
      `,
    );
    const aggregate = reader.getRowObjectsJson()[0] as ColumnAggregateRow;
    const nullCount = this.toNumber(aggregate.null_count);
    const emptyStringCount = this.toNumber(aggregate.empty_string_count);
    const nonMissingCount = this.toNumber(aggregate.non_missing_count);
    const numericCount = this.toNumber(aggregate.numeric_count);
    const uniqueCount = this.toNumber(aggregate.unique_count);
    const isNumericTextColumn =
      this.isTextColumn(column) && nonMissingCount > 0 && numericCount === nonMissingCount;
    const inferredType = isNumericTextColumn ? "NUMBER" : column.dataType;

    return {
      columnName: column.name,
      declaredType: column.dataType,
      emptyStringCount,
      emptyStringRatio: this.ratio(emptyStringCount, rowCount),
      inferredType,
      maxValue: isNumericTextColumn
        ? this.toProfileValueString(aggregate.numeric_max_value)
        : this.toOptionalString(aggregate.max_value),
      minValue: isNumericTextColumn
        ? this.toProfileValueString(aggregate.numeric_min_value)
        : this.toOptionalString(aggregate.min_value),
      nonNullCount: this.toNumber(aggregate.non_null_count),
      nullCount,
      nullRatio: this.ratio(nullCount, rowCount),
      ordinalPosition: column.ordinalPosition,
      rowCount: this.toNumber(aggregate.row_count),
      statsJson: JSON.stringify({
        declaredType: column.dataType,
        inferredType,
        missingCount: nullCount + emptyStringCount,
        numericCount,
      }),
      uniqueCount,
      uniqueRatio: this.ratio(uniqueCount, rowCount),
    };
  }

  private calculateQualityScore(input: {
    duplicateRowRatio: number;
    emptyColumnCount: number;
    emptyRowRatio: number;
    missingCellRatio: number;
  }): number {
    const score =
      100 -
      input.missingCellRatio * 45 -
      input.duplicateRowRatio * 25 -
      input.emptyRowRatio * 20 -
      Math.min(input.emptyColumnCount * 5, 20);

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private buildQualityIssues(input: {
    duplicateRowRatio: number;
    emptyColumnCount: number;
    emptyRowRatio: number;
    missingCellRatio: number;
  }): Array<{ code: string; severity: "low" | "medium" | "high"; message: string }> {
    const issues: Array<{
      code: string;
      severity: "low" | "medium" | "high";
      message: string;
    }> = [];

    if (input.missingCellRatio > 0) {
      issues.push({
        code: "missing_cells",
        message: "Dataset contains missing cells.",
        severity: input.missingCellRatio > 0.2 ? "high" : "medium",
      });
    }

    if (input.duplicateRowRatio > 0) {
      issues.push({
        code: "duplicate_rows",
        message: "Dataset contains duplicate rows.",
        severity: input.duplicateRowRatio > 0.1 ? "high" : "medium",
      });
    }

    if (input.emptyRowRatio > 0) {
      issues.push({
        code: "empty_rows",
        message: "Dataset contains empty rows.",
        severity: "medium",
      });
    }

    if (input.emptyColumnCount > 0) {
      issues.push({
        code: "empty_columns",
        message: "Dataset contains empty columns.",
        severity: "high",
      });
    }

    return issues;
  }

  private buildSuggestedActions(
    issues: Array<{ code: string }>,
  ): Array<{ code: string; message: string }> {
    const actionsByIssue: Record<string, string> = {
      duplicate_rows: "Review and remove duplicate records if they are not expected.",
      empty_columns: "Drop empty columns before analysis or modeling.",
      empty_rows: "Remove empty rows from the dataset.",
      missing_cells: "Fill, remove, or flag missing values based on column meaning.",
    };

    return issues.map((issue) => ({
      code: issue.code,
      message: actionsByIssue[issue.code] ?? "Review this quality issue.",
    }));
  }

  private isMissingSql(column: ColumnSchema): string {
    const columnSql = this.sqlIdentifier(column.name);

    if (!this.isTextColumn(column)) {
      return `${columnSql} IS NULL`;
    }

    return `${columnSql} IS NULL OR ${columnSql} = ''`;
  }

  private isPresentSql(column: ColumnSchema): string {
    return `NOT (${this.isMissingSql(column)})`;
  }

  private isTextColumn(column: ColumnSchema): boolean {
    return /CHAR|TEXT|STRING|VARCHAR/i.test(column.dataType);
  }

  private normalizedTextValueSql(columnSql: string): string {
    return `NULLIF(TRIM(${columnSql}), '')`;
  }

  private readParquetSql(parquetPath: string): string {
    return `read_parquet(${this.sqlString(this.toDuckDbPath(parquetPath))})`;
  }

  private ratio(numerator: number, denominator: number): number {
    if (denominator <= 0) {
      return 0;
    }

    return numerator / denominator;
  }

  private toNumber(value: unknown): number {
    return Number(value ?? 0);
  }

  private toOptionalString(value: unknown): string | undefined {
    if (value === null || value === undefined) {
      return undefined;
    }

    return String(value);
  }

  private toProfileValueString(value: unknown): string | undefined {
    if (value === null || value === undefined) {
      return undefined;
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return Number.isInteger(value) ? value.toLocaleString("en-US", {
        maximumFractionDigits: 0,
        useGrouping: false,
      }) : String(value);
    }

    return String(value);
  }

  private async withDuckDbStage<T>(
    stage: string,
    callback: () => Promise<T>,
  ): Promise<T> {
    try {
      return await callback();
    } catch (error) {
      throw new Error(`DuckDB ${stage} failed: ${this.getErrorMessage(error)}`);
    }
  }

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }

  private toDuckDbPath(filePath: string): string {
    return path.resolve(filePath).replace(/\\/g, "/");
  }

  private sqlIdentifier(value: string): string {
    return `"${value.replace(/"/g, '""')}"`;
  }

  private sqlString(value: string): string {
    return `'${value.replace(/'/g, "''")}'`;
  }
}
