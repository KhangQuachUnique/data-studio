import type { WorkspaceRepository } from "./WorkspaceRepository";
import type { AppSettingsRepository } from "@core/modules/settings";
import type { CreateWorkspaceInput } from "@shared/workspace/dtos";
import type {
  Workspace,
  WorkspaceDetail,
  WorkspaceIntegrityCheck,
} from "@shared/workspace/entities";
import { slugify } from "@core/utils/slugify";
import path from "node:path";
import { generateId } from "@core/utils/id";
import { nowIso } from "@core/utils/date";
import fs from "node:fs/promises";

export class WorkspaceService {
  private readonly lastOpenedWorkspaceKey = "last_opened_workspace_id";

  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly workspacesRootPath: string,
    private readonly appSettingsRepository: AppSettingsRepository,
  ) {}

  async listWorkspaces(): Promise<Workspace[]> {
    return this.workspaceRepository.findAll();
  }

  async getWorkspaceDetail(workspaceId: string): Promise<WorkspaceDetail> {
    const workspace = await this.getWorkspaceOrThrow(workspaceId);

    return {
      workspace,
      integrity: await this.getIntegrityChecks(workspace),
    };
  }

  async getLastOpenedWorkspace(): Promise<Workspace | null> {
    const workspaceId = await this.appSettingsRepository.get(
      this.lastOpenedWorkspaceKey,
    );

    if (!workspaceId) {
      return null;
    }

    return this.workspaceRepository.findById(workspaceId);
  }

  async setLastOpenedWorkspace(workspaceId: string): Promise<Workspace> {
    const workspace = await this.getWorkspaceOrThrow(workspaceId);

    await this.appSettingsRepository.set(this.lastOpenedWorkspaceKey, workspace.id);

    return workspace;
  }

  async archiveWorkspace(workspaceId: string): Promise<Workspace> {
    const workspace = await this.getWorkspaceOrThrow(workspaceId);
    const archivedWorkspace: Workspace = {
      ...workspace,
      status: "ARCHIVED",
      updatedAt: nowIso(),
    };

    await this.workspaceRepository.update(archivedWorkspace);
    await this.writeWorkspaceManifest(archivedWorkspace);

    return archivedWorkspace;
  }

  async unarchiveWorkspace(workspaceId: string): Promise<Workspace> {
    const workspace = await this.getWorkspaceOrThrow(workspaceId);
    const activeWorkspace: Workspace = {
      ...workspace,
      status: "ACTIVE",
      updatedAt: nowIso(),
    };

    await this.workspaceRepository.update(activeWorkspace);
    await this.writeWorkspaceManifest(activeWorkspace);

    return activeWorkspace;
  }

  async createWorkspace(payload: CreateWorkspaceInput): Promise<Workspace> {
    const name = payload.name.trim();

    if (!name) {
      throw new Error("Workspace name cannot be empty");
    }

    const baseSlug = slugify(name);

    if (!baseSlug) {
      throw new Error(
        "Workspace name must contain at least one alphanumeric character",
      );
    }

    const slug = await this.generateUniqueSlug(baseSlug);

    const workspacePath = path.join(this.workspacesRootPath, slug);

    const duckdbPath = path.join(workspacePath, "duckdb", "workspace.duckdb");

    const now = nowIso();

    const workspace: Workspace = {
      id: generateId("workspace"),
      name,
      slug,
      description: payload.description?.trim() || undefined,
      path: workspacePath,
      duckdbPath,
      status: "ACTIVE",
      createdAt: now,
      updatedAt: now,
    };

    await this.createWorkspaceDirectories(workspace);
    await this.writeWorkspaceManifest(workspace);
    await this.workspaceRepository.create(workspace);

    return workspace;
  }

  private async getWorkspaceOrThrow(workspaceId: string): Promise<Workspace> {
    const workspace = await this.workspaceRepository.findById(workspaceId);

    if (!workspace) {
      throw new Error("Workspace not found");
    }

    return workspace;
  }

  private async getIntegrityChecks(
    workspace: Workspace,
  ): Promise<WorkspaceIntegrityCheck[]> {
    const checks: WorkspaceIntegrityCheck[] = [
      {
        key: "workspace-root",
        label: "Workspace folder",
        path: workspace.path,
        exists: false,
      },
      {
        key: "raw-data",
        label: "Raw data folder",
        path: path.join(workspace.path, "data", "raw"),
        exists: false,
      },
      {
        key: "datasets",
        label: "Datasets folder",
        path: path.join(workspace.path, "data", "datasets"),
        exists: false,
      },
      {
        key: "duckdb-folder",
        label: "DuckDB folder",
        path: path.dirname(workspace.duckdbPath),
        exists: false,
      },
      {
        key: "queries-folder",
        label: "Queries folder",
        path: path.join(workspace.path, "queries"),
        exists: false,
      },
      {
        key: "exports-folder",
        label: "Exports folder",
        path: path.join(workspace.path, "exports"),
        exists: false,
      },
      {
        key: "manifest",
        label: "Manifest file",
        path: path.join(workspace.path, "manifest.json"),
        exists: false,
      },
    ];

    return Promise.all(
      checks.map(async (check) => ({
        ...check,
        exists: await this.pathExists(check.path),
      })),
    );
  }

  // Generates a unique slug by appending a counter if necessary
  private async generateUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let counter = 2;

    while (await this.workspaceRepository.findBySlug(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  // Creates necessary directories for the workspace
  private async createWorkspaceDirectories(
    workspace: Workspace,
  ): Promise<void> {
    await fs.mkdir(workspace.path, { recursive: true });
    await fs.mkdir(path.join(workspace.path, "data", "raw"), {
      recursive: true,
    });
    await fs.mkdir(path.join(workspace.path, "data", "datasets"), {
      recursive: true,
    });
    await fs.mkdir(path.join(workspace.path, "duckdb"), { recursive: true });
    await fs.mkdir(path.join(workspace.path, "queries"), { recursive: true });
    await fs.mkdir(path.join(workspace.path, "exports"), { recursive: true });
  }

  // Writes the workspace manifest file to the workspace directory
  private async writeWorkspaceManifest(workspace: Workspace): Promise<void> {
    const manifestPath = path.join(workspace.path, "manifest.json");
    await fs.writeFile(
      manifestPath,
      JSON.stringify(workspace, null, 2),
      "utf-8",
    );
  }

  private async pathExists(targetPath: string): Promise<boolean> {
    try {
      await fs.access(targetPath);
      return true;
    } catch {
      return false;
    }
  }
}
