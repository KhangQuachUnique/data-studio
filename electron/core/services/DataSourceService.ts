import fs from "node:fs/promises";
import { createReadStream } from "node:fs";
import path from "node:path";
import readline from "node:readline";
import type {
  DataSource,
  ImportCsvInput,
  ImportCsvResult,
} from "@shared/types/DataSource";
import type { WorkspaceRepository } from "@core/repositories/workspace/WorkspaceRepository";
import type { DataSourceRepository } from "@core/repositories/data-source/DataSourceRepository";
import type { DatasetVersionRepository } from "@core/repositories/dataset-version/DatasetVersionRepository";
import { nowIso } from "@core/utils/date";
import { generateId } from "@core/utils/id";
import { slugify } from "@core/utils/slugify";

interface CsvStats {
  rowCount: number;
  columnCount: number;
}

export class DataSourceService {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly dataSourceRepository: DataSourceRepository,
    private readonly datasetVersionRepository: DatasetVersionRepository,
  ) {}

  async listDataSources(workspaceId: string): Promise<DataSource[]> {
    await this.getWorkspaceOrThrow(workspaceId);

    return this.dataSourceRepository.findByWorkspaceId(workspaceId);
  }

  async importCsv(input: ImportCsvInput): Promise<ImportCsvResult> {
    const workspace = await this.getActiveWorkspaceOrThrow(input.workspaceId);
    const sourcePath = path.resolve(input.filePath);

    await this.validateCsvFile(sourcePath);

    const dataSourceId = generateId("data_source");
    const versionId = generateId("dataset_version");
    const now = nowIso();
    const rawDir = path.join(workspace.path, "data", "raw");
    const storedPath = await this.copyCsvToRawDir(sourcePath, rawDir);
    const stats = await this.readCsvStats(storedPath, {
      delimiter: input.delimiter ?? ",",
      hasHeader: input.hasHeader,
    });
    const fileStat = await fs.stat(storedPath);
    const sourceName = path.basename(sourcePath);
    const tableName = this.createTableName(sourceName, dataSourceId);

    const currentVersion = {
      id: versionId,
      workspaceId: workspace.id,
      dataSourceId,
      versionNumber: 1,
      sourceKind: "IMPORT" as const,
      tableName,
      rowCount: stats.rowCount,
      columnCount: stats.columnCount,
      status: "READY" as const,
      createdAt: now,
      updatedAt: now,
    };

    const initialDataSource: DataSource = {
      id: dataSourceId,
      workspaceId: workspace.id,
      name: sourceName,
      type: "CSV",
      originalPath: sourcePath,
      storedPath,
      tableName,
      status: "READY",
      fileSizeBytes: fileStat.size,
      delimiter: input.delimiter ?? ",",
      hasHeader: input.hasHeader,
      rowCount: stats.rowCount,
      columnCount: stats.columnCount,
      profileStatus: "NOT_STARTED",
      createdAt: now,
      updatedAt: now,
    };

    await this.dataSourceRepository.create(initialDataSource);
    await this.datasetVersionRepository.create(currentVersion);
    const dataSource = await this.dataSourceRepository.update({
      ...initialDataSource,
      currentVersionId: versionId,
      updatedAt: nowIso(),
    });

    return {
      dataSource,
      currentVersion,
    };
  }

  private async getWorkspaceOrThrow(workspaceId: string) {
    const workspace = await this.workspaceRepository.findById(workspaceId);

    if (!workspace) {
      throw new Error(`Workspace not found: ${workspaceId}`);
    }

    return workspace;
  }

  private async getActiveWorkspaceOrThrow(workspaceId: string) {
    const workspace = await this.getWorkspaceOrThrow(workspaceId);

    if (workspace.status === "ARCHIVED") {
      throw new Error("Cannot import data into an archived workspace.");
    }

    return workspace;
  }

  private async validateCsvFile(filePath: string): Promise<void> {
    const stat = await fs.stat(filePath);

    if (!stat.isFile()) {
      throw new Error("Selected path is not a file.");
    }

    if (path.extname(filePath).toLowerCase() !== ".csv") {
      throw new Error("Only CSV files are supported in this phase.");
    }
  }

  private async copyCsvToRawDir(
    sourcePath: string,
    rawDir: string,
  ): Promise<string> {
    await fs.mkdir(rawDir, { recursive: true });

    const sourceName = path.basename(sourcePath);
    const storedPath = await this.getUniqueStoredPath(rawDir, sourceName);

    await fs.copyFile(sourcePath, storedPath);

    return storedPath;
  }

  private async getUniqueStoredPath(
    directoryPath: string,
    fileName: string,
  ): Promise<string> {
    const parsed = path.parse(fileName);
    const safeBaseName = slugify(parsed.name) || "dataset";
    const extension = parsed.ext.toLowerCase() || ".csv";
    let candidate = path.join(directoryPath, `${safeBaseName}${extension}`);
    let counter = 2;

    while (await this.pathExists(candidate)) {
      candidate = path.join(
        directoryPath,
        `${safeBaseName}-${counter}${extension}`,
      );
      counter += 1;
    }

    return candidate;
  }

  private async pathExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private async readCsvStats(
    filePath: string,
    options: { delimiter: string; hasHeader: boolean },
  ): Promise<CsvStats> {
    const stream = createReadStream(filePath, { encoding: "utf-8" });
    const lines = readline.createInterface({
      crlfDelay: Infinity,
      input: stream,
    });

    let lineCount = 0;
    let columnCount = 0;

    for await (const line of lines) {
      if (lineCount === 0) {
        columnCount = this.splitCsvLine(line, options.delimiter).length;
      }

      if (line.trim().length > 0) {
        lineCount += 1;
      }
    }

    return {
      columnCount,
      rowCount: options.hasHeader ? Math.max(lineCount - 1, 0) : lineCount,
    };
  }

  private splitCsvLine(line: string, delimiter: string): string[] {
    const columns: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];
      const nextChar = line[index + 1];

      if (char === '"' && nextChar === '"') {
        current += char;
        index += 1;
        continue;
      }

      if (char === '"') {
        inQuotes = !inQuotes;
        continue;
      }

      if (char === delimiter && !inQuotes) {
        columns.push(current);
        current = "";
        continue;
      }

      current += char;
    }

    columns.push(current);

    return columns;
  }

  private createTableName(fileName: string, dataSourceId: string): string {
    const baseName = slugify(path.parse(fileName).name) || "dataset";
    const suffix = dataSourceId.replace(/[^a-zA-Z0-9]/g, "").slice(-8);

    return `ds_${baseName}_${suffix}_v1`;
  }
}
