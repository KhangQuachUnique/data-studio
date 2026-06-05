import type { WorkspaceRepository } from "@core/repositories/workspace/WorkspaceRepository";
import { CreateWorkspaceInput, Workspace } from "@shared/types/Workspace";
import { slugify } from "../utils/slugify";
import path from "node:path";
import { generateId } from "../utils/id";
import { nowIso } from "../utils/date";
import fs from "node:fs/promises";

export class WorkspaceService {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly workspacesRootPath: string,
  ) {}

  async listWorkspaces(): Promise<Workspace[]> {
    return this.workspaceRepository.findAll();
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
}
