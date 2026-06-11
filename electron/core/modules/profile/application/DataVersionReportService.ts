import path from "node:path";
import type { WorkspaceRepository } from "@core/modules/workspace";
import type { DatasetVersionRepository } from "@core/modules/data-source";
import type { DatasetVersionReport } from "@shared/profile/entities";
import type { DatasetProfileEngine } from "./DatasetProfileEngine";
import type {
  DatasetVersionReportRepository,
  DatasetVersionReportUpdate,
} from "./DatasetVersionReportRepository";
import { DatasetProfileMapper } from "./DatasetProfileMapper";
import { nowIso } from "@core/utils/date";
import { generateId } from "@core/utils/id";

export class DataVersionReportService {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly datasetVersionRepository: DatasetVersionRepository,
    private readonly datasetVersionReportRepository: DatasetVersionReportRepository,
    private readonly datasetProfileEngine: DatasetProfileEngine,
  ) {}

  async getReportByDatasetVersionId(
    datasetVersionId: string,
  ): Promise<DatasetVersionReport | null> {
    return this.datasetVersionReportRepository.getReportByDatasetVersionId(
      datasetVersionId,
    );
  }

  async runProfile(datasetVersionId: string): Promise<DatasetVersionReport> {
    const version = await this.datasetVersionRepository.findById(
      datasetVersionId,
    );

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
        status: "running",
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
          status: "success",
        },
      );

      return report;
    } catch (error) {
      await this.datasetVersionReportRepository.updateReport(report.id, {
        errorMessage: this.getErrorMessage(error),
        finishedAt: nowIso(),
        status: "failed",
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
}
