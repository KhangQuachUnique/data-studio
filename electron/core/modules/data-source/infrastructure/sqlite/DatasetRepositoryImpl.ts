import type { SqliteDatabase } from "@core/db/SqliteConnection";
import type { Dataset, DatasetKind, DatasetStatus } from "@shared/dataset/entities";
import type { DatasetRepository } from "../../application/DatasetRepository";

interface DatasetRow {
  id: string;
  workspace_id: string;
  source_id: string | null;
  name: string;
  display_name: string | null;
  description: string | null;
  dataset_kind: string;
  status: string;
  current_version_id: string | null;
  created_at: string;
  updated_at: string;
}

const datasetColumns = `
  id,
  workspace_id,
  source_id,
  name,
  display_name,
  description,
  dataset_kind,
  status,
  current_version_id,
  created_at,
  updated_at
`;

export class SqliteDatasetRepository implements DatasetRepository {
  constructor(private readonly db: SqliteDatabase) {}

  async findById(id: string): Promise<Dataset | null> {
    const row = this.db
      .prepare(
        `
        SELECT ${datasetColumns}
        FROM datasets
        WHERE id = ?
        `,
      )
      .get(id) as DatasetRow | undefined;

    return row ? this.toDomain(row) : null;
  }

  async findBySourceId(sourceId: string): Promise<Dataset | null> {
    const row = this.db
      .prepare(
        `
        SELECT ${datasetColumns}
        FROM datasets
        WHERE source_id = ?
        ORDER BY created_at DESC
        LIMIT 1
        `,
      )
      .get(sourceId) as DatasetRow | undefined;

    return row ? this.toDomain(row) : null;
  }

  async create(dataset: Dataset): Promise<Dataset> {
    this.db
      .prepare(
        `
        INSERT INTO datasets (
          id,
          workspace_id,
          source_id,
          name,
          display_name,
          description,
          dataset_kind,
          status,
          current_version_id,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
      )
      .run(
        dataset.id,
        dataset.workspaceId,
        dataset.sourceId ?? null,
        dataset.name,
        dataset.displayName ?? null,
        dataset.description ?? null,
        dataset.datasetKind,
        dataset.status,
        dataset.currentVersionId ?? null,
        dataset.createdAt,
        dataset.updatedAt,
      );

    return dataset;
  }

  async update(dataset: Dataset): Promise<Dataset> {
    this.db
      .prepare(
        `
        UPDATE datasets
        SET
          source_id = ?,
          name = ?,
          display_name = ?,
          description = ?,
          dataset_kind = ?,
          status = ?,
          current_version_id = ?,
          updated_at = ?
        WHERE id = ?
        `,
      )
      .run(
        dataset.sourceId ?? null,
        dataset.name,
        dataset.displayName ?? null,
        dataset.description ?? null,
        dataset.datasetKind,
        dataset.status,
        dataset.currentVersionId ?? null,
        dataset.updatedAt,
        dataset.id,
      );

    return dataset;
  }

  private toDomain(row: DatasetRow): Dataset {
    return {
      id: row.id,
      workspaceId: row.workspace_id,
      sourceId: row.source_id ?? undefined,
      name: row.name,
      displayName: row.display_name ?? undefined,
      description: row.description ?? undefined,
      datasetKind: row.dataset_kind as DatasetKind,
      status: row.status as DatasetStatus,
      currentVersionId: row.current_version_id ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
