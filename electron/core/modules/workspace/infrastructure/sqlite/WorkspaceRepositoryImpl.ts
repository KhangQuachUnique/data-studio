import type { Workspace, WorkspaceStatus } from "@shared/workspace/entities";
import type { SqliteDatabase } from "@core/db/SqliteConnection";
import type { WorkspaceRepository } from "../../application/WorkspaceRepository";
import path from "node:path";

interface WorkspaceRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  root_path: string;
  status: string;
  created_at: string;
  updated_at: string;
  last_opened_at: string | null;
}

export class SqliteWorkspaceRepository implements WorkspaceRepository {
  constructor(private readonly db: SqliteDatabase) {}

  async findAll(): Promise<Workspace[]> {
    const rows = this.db
      .prepare(
        `
        SELECT 
          id,
          name,
          slug,
          description,
          root_path,
          status,
          created_at,
          updated_at,
          last_opened_at
        FROM workspaces
        ORDER BY updated_at DESC
        `,
      )
      .all() as WorkspaceRow[];

    return rows.map((row) => this.toDomain(row));
  }

  async findById(id: string): Promise<Workspace | null> {
    const row = this.db
      .prepare(
        `
        SELECT 
          id,
          name,
          slug,
          description,
          root_path,
          status,
          created_at,
          updated_at,
          last_opened_at
        FROM workspaces
        WHERE id = ?
        `,
      )
      .get(id) as WorkspaceRow | undefined;

    return row ? this.toDomain(row) : null;
  }

  async findBySlug(slug: string): Promise<Workspace | null> {
    const row = this.db
      .prepare(
        `
        SELECT 
          id,
          name,
          slug,
          description,
          root_path,
          status,
          created_at,
          updated_at,
          last_opened_at
        FROM workspaces
        WHERE slug = ?
        `,
      )
      .get(slug) as WorkspaceRow | undefined;

    return row ? this.toDomain(row) : null;
  }

  async create(workspace: Workspace): Promise<Workspace> {
    this.db
      .prepare(
        `
        INSERT INTO workspaces (
          id,
          name,
          slug,
          description,
          root_path,
          status,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
      )
      .run(
        workspace.id,
        workspace.name,
        workspace.slug,
        workspace.description ?? null,
        workspace.path,
        workspace.status,
        workspace.createdAt,
        workspace.updatedAt,
      );

    return workspace;
  }

  async update(workspace: Workspace): Promise<Workspace> {
    this.db
      .prepare(
        `
        UPDATE workspaces
        SET
          name = ?,
          slug = ?,
          description = ?,
          root_path = ?,
          status = ?,
          updated_at = ?
        WHERE id = ?
        `,
      )
      .run(
        workspace.name,
        workspace.slug,
        workspace.description ?? null,
        workspace.path,
        workspace.status,
        workspace.updatedAt,
        workspace.id,
      );

    return workspace;
  }

  private toDomain(row: WorkspaceRow): Workspace {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description ?? undefined,
      path: row.root_path,
      duckdbPath: path.join(row.root_path, "duckdb", "workspace.duckdb"),
      status: row.status as WorkspaceStatus,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
