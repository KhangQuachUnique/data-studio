import fs from "node:fs/promises";
import path from "node:path";
import type {
  DataSource,
  DataSourceListItem,
  DataSourcePreview,
} from "@shared/data-source/entities";
import type { ImportCsvInput, ImportCsvResult } from "@shared/data-source/dtos";
import type { Dataset } from "@shared/dataset/entities";
import type { DatasetVersion } from "@shared/dataset-version/entities";
import type { DatasetVersionColumn } from "@shared/dataset-version-column/entities";
import type { Operation } from "@shared/operation/entities";
import type { WorkspaceRepository } from "@core/modules/workspace";
import type { DataSourceRepository } from "./DataSourceRepository";
import type { DatasetRepository } from "./DatasetRepository";
import type { DatasetVersionRepository } from "./DatasetVersionRepository";
import type { DatasetVersionColumnRepository } from "./DatasetVersionColumnRepository";
import type { OperationRepository } from "./OperationRepository";
import { nowIso } from "@core/utils/date";
import { generateId } from "@core/utils/id";
import { slugify } from "@core/utils/slugify";
import { DuckDbService } from "@core/services/DuckDbService";

export class DataSourceService {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly dataSourceRepository: DataSourceRepository,
    private readonly datasetRepository: DatasetRepository,
    private readonly datasetVersionRepository: DatasetVersionRepository,
    private readonly datasetVersionColumnRepository: DatasetVersionColumnRepository,
    private readonly operationRepository: OperationRepository,
    private readonly duckDbService: DuckDbService,
  ) {}

  async listDataSources(workspaceId: string): Promise<DataSourceListItem[]> {
    await this.getWorkspaceOrThrow(workspaceId);

    return this.dataSourceRepository.findByWorkspaceId(workspaceId);
  }

  async previewDataSource(
    workspaceId: string,
    dataSourceId: string,
    rowLimit = 100,
  ): Promise<DataSourcePreview> {
    const workspace = await this.getWorkspaceOrThrow(workspaceId);
    const dataSource = await this.dataSourceRepository.findById(dataSourceId);

    if (!dataSource || dataSource.workspaceId !== workspace.id) {
      throw new Error("Data source not found.");
    }

    const dataset = await this.datasetRepository.findBySourceId(dataSource.id);

    if (!dataset?.currentVersionId) {
      throw new Error("Data source does not have a current dataset version yet.");
    }

    const currentVersion = await this.datasetVersionRepository.findById(
      dataset.currentVersionId,
    );

    if (!currentVersion || currentVersion.storageFormat !== "parquet") {
      throw new Error("Current dataset version is not a parquet artifact.");
    }

    return this.duckDbService.previewParquet(
      workspace.duckdbPath,
      this.resolveWorkspacePath(workspace.path, currentVersion.storageUri),
      rowLimit,
    );
  }

  async deleteDataSource(
    workspaceId: string,
    dataSourceId: string,
  ): Promise<void> {
    const workspace = await this.getActiveWorkspaceOrThrow(workspaceId);
    const dataSource = await this.dataSourceRepository.findById(dataSourceId);

    if (!dataSource || dataSource.workspaceId !== workspace.id) {
      throw new Error("Data source not found.");
    }

    const dataset = await this.datasetRepository.findBySourceId(dataSource.id);

    if (dataset) {
      const versions = await this.datasetVersionRepository.findByDatasetId(
        dataset.id,
      );

      for (const version of versions) {
        if (version.storageFormat === "parquet") {
          await this.deleteStoredFileIfInsideWorkspace(
            this.resolveWorkspacePath(workspace.path, version.storageUri),
            workspace.path,
          );
        }
      }
    }

    const copiedRawPath = this.readRawStoredPathFromConfig(dataSource.configJson);

    if (copiedRawPath) {
      await this.deleteStoredFileIfInsideWorkspace(
        this.resolveWorkspacePath(workspace.path, copiedRawPath),
        workspace.path,
      );
    }

    await this.dataSourceRepository.deleteById(dataSource.id);
  }

  async importCsv(input: ImportCsvInput): Promise<ImportCsvResult> {
    return this.importFile(input);
  }

  private async importFile(input: ImportCsvInput): Promise<ImportCsvResult> {
    const workspace = await this.getActiveWorkspaceOrThrow(input.workspaceId);
    const sourcePath = path.resolve(input.filePath);

    await this.validateCsvFile(sourcePath);

    const dataSourceId = generateId("data_source");
    const datasetId = generateId("dataset");
    const versionId = generateId("dataset_version");
    const operationId = generateId("operation");
    const now = nowIso();
    const sourceName = path.basename(sourcePath);
    const datasetName = this.createDatasetName(sourceName, datasetId);
    const rawDir = path.join(workspace.path, "data", "raw");
    const copiedCsvPath = await this.copyCsvToRawDir(sourcePath, rawDir);
    const parquetRelativePath = path.join(
      "data",
      "datasets",
      datasetId,
      "versions",
      "v1",
      "data.parquet",
    );
    const parquetPath = path.join(workspace.path, parquetRelativePath);
    const delimiter = input.delimiter ?? ",";

    let operation: Operation = {
      id: operationId,
      workspaceId: workspace.id,
      operationType: "import",
      status: "running",
      engineType: "duckdb",
      name: `Import ${sourceName}`,
      configJson: JSON.stringify({
        copiedRawPath: this.toWorkspaceRelativePath(workspace.path, copiedCsvPath),
        delimiter,
        hasHeader: input.hasHeader,
        originalPath: sourcePath,
        sourceFormat: "csv",
      }),
      createdAt: now,
      startedAt: now,
    };

    await this.operationRepository.create(operation);

    try {
      const stats = await this.duckDbService.convertCsvToParquet({
        csvPath: copiedCsvPath,
        delimiter,
        duckdbPath: workspace.duckdbPath,
        hasHeader: input.hasHeader,
        parquetPath,
      });

      const dataSource: DataSource = {
        id: dataSourceId,
        workspaceId: workspace.id,
        name: sourceName,
        sourceType: "file",
        sourceUri: sourcePath,
        provider: "local",
        configJson: operation.configJson,
        createdAt: now,
        updatedAt: now,
      };
      const dataset: Dataset = {
        id: datasetId,
        workspaceId: workspace.id,
        sourceId: dataSource.id,
        name: datasetName,
        displayName: path.parse(sourceName).name,
        datasetKind: "raw",
        status: "active",
        createdAt: now,
        updatedAt: now,
      };
      const currentVersion: DatasetVersion = {
        id: versionId,
        workspaceId: workspace.id,
        datasetId: dataset.id,
        versionNumber: 1,
        storageFormat: "parquet",
        storageUri: parquetRelativePath,
        rowCount: stats.rowCount,
        columnCount: stats.columnCount,
        sizeBytes: stats.sizeBytes,
        schemaJson: stats.schemaJson,
        createdByOperationId: operation.id,
        createdAt: now,
      };
      const columns: DatasetVersionColumn[] = stats.columns.map((column) => ({
        id: generateId("dataset_column"),
        datasetVersionId: currentVersion.id,
        columnName: column.name,
        ordinalPosition: column.ordinalPosition,
        dataType: column.dataType,
        nullable: true,
        originalColumnName: column.name,
        createdAt: now,
      }));

      await this.dataSourceRepository.create(dataSource);
      await this.datasetRepository.create(dataset);
      await this.datasetVersionRepository.create(currentVersion);
      await this.datasetVersionColumnRepository.createMany(columns);
      const updatedDataset = await this.datasetRepository.update({
        ...dataset,
        currentVersionId: currentVersion.id,
        updatedAt: nowIso(),
      });

      operation = {
        ...operation,
        outputVersionId: currentVersion.id,
        resultJson: JSON.stringify({
          columnCount: stats.columnCount,
          parquetPath: parquetRelativePath,
          rowCount: stats.rowCount,
          sizeBytes: stats.sizeBytes,
        }),
        sourceId: dataSource.id,
        status: "success",
        finishedAt: nowIso(),
      };
      await this.operationRepository.update(operation);

      return {
        currentVersion,
        dataSource,
        dataset: updatedDataset,
      };
    } catch (error) {
      await this.deleteStoredFileIfInsideWorkspace(parquetPath, workspace.path);

      operation = {
        ...operation,
        errorMessage: this.getErrorMessage(error),
        status: "failed",
        finishedAt: nowIso(),
      };
      await this.operationRepository.update(operation);

      throw error;
    }
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

  private async deleteStoredFileIfInsideWorkspace(
    storedPath: string,
    workspacePath: string,
  ): Promise<void> {
    const resolvedStoredPath = path.resolve(storedPath);
    const resolvedWorkspacePath = path.resolve(workspacePath);
    const relativePath = path.relative(resolvedWorkspacePath, resolvedStoredPath);

    if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
      return;
    }

    try {
      await fs.unlink(resolvedStoredPath);
    } catch (error) {
      if (!this.isFileNotFoundError(error)) {
        throw error;
      }
    }
  }

  private isFileNotFoundError(error: unknown): boolean {
    return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ENOENT"
    );
  }

  private createDatasetName(fileName: string, datasetId: string): string {
    const baseName = slugify(path.parse(fileName).name) || "dataset";
    const suffix = datasetId.replace(/[^a-zA-Z0-9]/g, "").slice(-8);

    return `${baseName}_${suffix}`;
  }

  private resolveWorkspacePath(workspacePath: string, storedPath: string): string {
    if (path.isAbsolute(storedPath)) {
      return storedPath;
    }

    return path.join(workspacePath, storedPath);
  }

  private toWorkspaceRelativePath(workspacePath: string, storedPath: string): string {
    return path.relative(workspacePath, storedPath);
  }

  private readRawStoredPathFromConfig(configJson: string | undefined): string | null {
    if (!configJson) {
      return null;
    }

    try {
      const parsed = JSON.parse(configJson) as { copiedRawPath?: unknown };

      return typeof parsed.copiedRawPath === "string"
        ? parsed.copiedRawPath
        : null;
    } catch {
      return null;
    }
  }

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : "Unknown import error.";
  }
}
