import fs from "node:fs/promises";
import path from "node:path";
import { DuckDBInstance } from "@duckdb/node-api";

export interface ConvertCsvToParquetInput {
  duckdbPath: string;
  csvPath: string;
  parquetPath: string;
  delimiter: string;
  hasHeader: boolean;
}

export interface ParquetColumnSchema {
  name: string;
  dataType: string;
  ordinalPosition: number;
}

export interface ParquetDatasetStats {
  rowCount: number;
  columnCount: number;
  sizeBytes: number;
  columns: ParquetColumnSchema[];
  schemaJson: string;
}

export interface TablePreview {
  columns: string[];
  rows: Record<string, unknown>[];
  rowLimit: number;
}

export class DuckDbService {
  async convertCsvToParquet(
    input: ConvertCsvToParquetInput,
  ): Promise<ParquetDatasetStats> {
    await fs.mkdir(path.dirname(input.parquetPath), { recursive: true });

    const instance = await this.withDuckDbStage("open in-memory engine", () =>
      this.createEngineInstance(),
    );
    const connection = await this.withDuckDbStage("connect engine", () =>
      instance.connect(),
    );

    try {
      await this.withDuckDbStage("convert CSV to Parquet", () =>
        this.copyCsvToParquet(connection, input, input.delimiter),
      );
    } catch (error) {
      await this.deleteFileIfExists(input.parquetPath);

      if (!this.isCsvSniffingError(error)) {
        throw error;
      }

      try {
        await this.withDuckDbStage("convert CSV to Parquet using sniffed delimiter", () =>
          this.copyCsvToParquet(connection, input),
        );
      } catch (fallbackError) {
        await this.deleteFileIfExists(input.parquetPath);
        throw fallbackError;
      }
    }

    try {
      return await this.withDuckDbStage("inspect Parquet", () =>
        this.inspectParquetOnConnection(connection, input.parquetPath),
      );
    } finally {
      connection.closeSync();
      instance.closeSync();
    }
  }

  async inspectParquet(
    duckdbPath: string,
    parquetPath: string,
  ): Promise<ParquetDatasetStats> {
    void duckdbPath;

    const instance = await this.withDuckDbStage("open in-memory engine", () =>
      this.createEngineInstance(),
    );
    const connection = await this.withDuckDbStage("connect engine", () =>
      instance.connect(),
    );

    try {
      return await this.withDuckDbStage("inspect Parquet", () =>
        this.inspectParquetOnConnection(connection, parquetPath),
      );
    } finally {
      connection.closeSync();
      instance.closeSync();
    }
  }

  async previewParquet(
    duckdbPath: string,
    parquetPath: string,
    rowLimit = 100,
  ): Promise<TablePreview> {
    void duckdbPath;

    const instance = await this.withDuckDbStage("open in-memory engine", () =>
      this.createEngineInstance(),
    );
    const connection = await this.withDuckDbStage("connect engine", () =>
      instance.connect(),
    );
    const safeRowLimit = Math.max(1, Math.min(Math.trunc(rowLimit), 500));

    try {
      const reader = await this.withDuckDbStage("preview Parquet", () =>
        connection.runAndReadAll(
          `
          SELECT *
          FROM read_parquet(${this.sqlString(this.toDuckDbPath(parquetPath))})
          LIMIT ${safeRowLimit}
          `,
        ),
      );

      return {
        columns: reader.deduplicatedColumnNames(),
        rowLimit: safeRowLimit,
        rows: reader.getRowObjectsJson() as Record<string, unknown>[],
      };
    } finally {
      connection.closeSync();
      instance.closeSync();
    }
  }

  private createEngineInstance(): Promise<DuckDBInstance> {
    return DuckDBInstance.create(":memory:");
  }

  private async copyCsvToParquet(
    connection: Awaited<ReturnType<DuckDBInstance["connect"]>>,
    input: ConvertCsvToParquetInput,
    delimiter?: string,
  ): Promise<void> {
    const delimiterOption = delimiter
      ? `delim = ${this.sqlString(delimiter)},`
      : "";
    const csvPath = this.toDuckDbPath(input.csvPath);
    const parquetPath = this.toDuckDbPath(input.parquetPath);

    await connection.run(
      `
      COPY (
        SELECT *
        FROM read_csv(
          ${this.sqlString(csvPath)},
          ${delimiterOption}
          header = ${input.hasHeader ? "true" : "false"},
          quote = '"',
          escape = '"',
          strict_mode = false,
          null_padding = true,
          ignore_errors = true,
          all_varchar = true,
          sample_size = -1,
          max_line_size = 10000000
        )
      )
      TO ${this.sqlString(parquetPath)}
      (FORMAT PARQUET)
      `,
    );
  }

  private async inspectParquetOnConnection(
    connection: Awaited<ReturnType<DuckDBInstance["connect"]>>,
    parquetPath: string,
  ): Promise<ParquetDatasetStats> {
    const duckDbParquetPath = this.toDuckDbPath(parquetPath);
    const schemaReader = await connection.runAndReadAll(
      `
      DESCRIBE SELECT *
      FROM read_parquet(${this.sqlString(duckDbParquetPath)})
      `,
    );
    const schemaRows = schemaReader.getRowObjectsJson() as Array<{
      column_name?: unknown;
      column_type?: unknown;
    }>;
    const columns = schemaRows.map((row, index) => ({
      dataType: String(row.column_type ?? "UNKNOWN"),
      name: String(row.column_name ?? `column_${index + 1}`),
      ordinalPosition: index + 1,
    }));
    const countReader = await connection.runAndReadAll(
      `
      SELECT count(*) AS row_count
      FROM read_parquet(${this.sqlString(duckDbParquetPath)})
      `,
    );
    const rowCount = Number(countReader.getRowsJS()[0]?.[0] ?? 0);
    const fileStat = await fs.stat(parquetPath);

    return {
      columnCount: columns.length,
      columns,
      rowCount,
      schemaJson: JSON.stringify({
        columns,
      }),
      sizeBytes: fileStat.size,
    };
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

  private async deleteFileIfExists(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      if (!this.isFileNotFoundError(error)) {
        throw error;
      }
    }
  }

  private isCsvSniffingError(error: unknown): boolean {
    return error instanceof Error && error.message.includes("sniffing file");
  }

  private isFileNotFoundError(error: unknown): boolean {
    return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ENOENT"
    );
  }

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }

  private toDuckDbPath(filePath: string): string {
    return path.resolve(filePath).replace(/\\/g, "/");
  }

  private sqlString(value: string): string {
    return `'${value.replace(/'/g, "''")}'`;
  }
}
