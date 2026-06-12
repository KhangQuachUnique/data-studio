import path from "node:path";
import type { WorkspaceRepository } from "@core/modules/workspace";
import type {
  DatasetVersionColumnRepository,
  DatasetVersionRepository,
} from "@core/modules/data-source";
import type { DatasetVersionColumn } from "@shared/dataset-version-column/entities";
import {
  type ColumnProfileReport,
  type DatasetVersionProfileDetail,
  ProfileReportStatus,
  type DatasetVersionReport,
} from "@shared/profile/entities";
import type { DatasetProfileEngine } from "./DatasetProfileEngine";
import type { DatasetProfileColumnResult } from "./DatasetProfileEngineTypes";
import type {
  DatasetVersionReportRepository,
  DatasetVersionReportUpdate,
} from "./DatasetVersionReportRepository";
import type { ColumnProfileReportRepository } from "./ColumnProfileReportRepository";
import { DatasetProfileMapper } from "./DatasetProfileMapper";
import { nowIso } from "@core/utils/date";
import { generateId } from "@core/utils/id";

export class DatasetVersionReportService {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly datasetVersionRepository: DatasetVersionRepository,
    private readonly datasetVersionColumnRepository: DatasetVersionColumnRepository,
    private readonly datasetVersionReportRepository: DatasetVersionReportRepository,
    private readonly columnProfileReportRepository: ColumnProfileReportRepository,
    private readonly datasetProfileEngine: DatasetProfileEngine,
  ) {}

  async getReportByDatasetVersionId(
    datasetVersionId: string,
  ): Promise<DatasetVersionProfileDetail | null> {
    const profileReport =
      await this.datasetVersionReportRepository.getReportByDatasetVersionId(
        datasetVersionId,
      );

    if (!profileReport) {
      return null;
    }

    return this.toProfileDetail(profileReport);
  }

  async runProfile(
    datasetVersionId: string,
  ): Promise<DatasetVersionProfileDetail> {
    const version =
      await this.datasetVersionRepository.findById(datasetVersionId);

    if (!version) {
      throw new Error(`Dataset version not found: ${datasetVersionId}`);
    }

    const workspace = await this.workspaceRepository.findById(
      version.workspaceId,
    );

    if (!workspace) {
      throw new Error(`Workspace not found: ${version.workspaceId}`);
    }

    const now = nowIso();
    let report = await this.datasetVersionReportRepository.createReport(
      version.id,
      {
        id: generateId("profile_report"),
        columnCount: version.columnCount,
        createdAt: now,
        datasetId: version.datasetId,
        datasetVersionId: version.id,
        rowCount: version.rowCount,
        sizeBytes: version.sizeBytes,
        status: ProfileReportStatus.RUNNING,
        workspaceId: version.workspaceId,
      },
    );

    try {
      const profileResult = await this.datasetProfileEngine.profileDataset({
        storageFormat: version.storageFormat,
        storagePath: this.resolveWorkspacePath(
          workspace.path,
          version.storageUri,
        ),
      });

      report = await this.datasetVersionReportRepository.updateReport(
        report.id,
        {
          ...DatasetProfileMapper.toReportUpdate(profileResult),
          finishedAt: nowIso(),
          status: ProfileReportStatus.SUCCESS,
        },
      );

      const datasetVersionColumns =
        await this.datasetVersionColumnRepository.findByDatasetVersionId(
          version.id,
        );
      await this.columnProfileReportRepository.createMany(
        this.toColumnProfileReports({
          columns: profileResult.columns,
          createdAt: nowIso(),
          datasetVersionColumns,
          datasetVersionId: version.id,
          profileReportId: report.id,
        }),
      );

      return this.toProfileDetail(report);
    } catch (error) {
      await this.datasetVersionReportRepository.updateReport(report.id, {
        errorMessage: this.getErrorMessage(error),
        finishedAt: nowIso(),
        status: ProfileReportStatus.FAILED,
      });

      throw error;
    }
  }

  async updateReport(
    reportId: string,
    report: DatasetVersionReportUpdate,
  ): Promise<DatasetVersionReport> {
    return this.datasetVersionReportRepository.updateReport(reportId, report);
  }

  private resolveWorkspacePath(
    workspacePath: string,
    storedPath: string,
  ): string {
    if (path.isAbsolute(storedPath)) {
      return storedPath;
    }

    return path.join(workspacePath, storedPath);
  }

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : "Unknown profile error.";
  }

  private async toProfileDetail(
    profileReport: DatasetVersionReport,
  ): Promise<DatasetVersionProfileDetail> {
    const columnReports =
      await this.columnProfileReportRepository.findByProfileReportId(
        profileReport.id,
      );

    return {
      columnReports,
      profileReport,
    };
  }

  private toColumnProfileReports(input: {
    columns: DatasetProfileColumnResult[];
    createdAt: string;
    datasetVersionColumns: DatasetVersionColumn[];
    datasetVersionId: string;
    profileReportId: string;
  }): ColumnProfileReport[] {
    const columnsByName = new Map(
      input.datasetVersionColumns.map((column) => [column.columnName, column]),
    );

    return input.columns.map((column) => {
      const versionColumn = columnsByName.get(column.columnName);

      if (!versionColumn) {
        throw new Error(`Dataset version column not found: ${column.columnName}`);
      }

      return {
        id: generateId("column_profile_report"),
        columnName: column.columnName,
        createdAt: input.createdAt,
        datasetVersionColumnId: versionColumn.id,
        datasetVersionId: input.datasetVersionId,
        declaredType: column.declaredType,
        emptyStringCount: column.emptyStringCount,
        emptyStringRatio: column.emptyStringRatio,
        inferredType: column.inferredType,
        issuesJson: column.issuesJson,
        maxValue: column.maxValue,
        minValue: column.minValue,
        nonNullCount: column.nonNullCount,
        nullCount: column.nullCount,
        nullRatio: column.nullRatio,
        ordinalPosition: column.ordinalPosition,
        profileReportId: input.profileReportId,
        rowCount: column.rowCount,
        sampleValuesJson: column.sampleValuesJson,
        statsJson: column.statsJson,
        topValuesJson: column.topValuesJson,
        uniqueCount: column.uniqueCount,
        uniqueRatio: column.uniqueRatio,
      };
    });
  }
}
