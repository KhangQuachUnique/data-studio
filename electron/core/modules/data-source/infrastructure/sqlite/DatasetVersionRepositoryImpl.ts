import type { SqliteDatabase } from "@core/db/SqliteConnection";
import type {
  DatasetStorageFormat,
  DatasetVersion,
} from "@shared/dataset-version/entities";
import type { DatasetVersionRepository } from "../../application/DatasetVersionRepository";

interface DatasetVersionRow {
  id: string;
  workspace_id: string;
  dataset_id: string;
  version_number: number;
  version_name: string | null;
  description: string | null;
  storage_format: string;
  storage_uri: string;
  row_count: number | null;
  column_count: number | null;
  size_bytes: number | null;
  schema_json: string | null;
  created_by_operation_id: string | null;
  created_at: string;
}

const datasetVersionColumns = `
  id,
  workspace_id,
  dataset_id,
  version_number,
  version_name,
  description,
  storage_format,
  storage_uri,
  row_count,
  column_count,
  size_bytes,
  schema_json,
  created_by_operation_id,
  created_at
`;

export class SqliteDatasetVersionRepository
  implements DatasetVersionRepository
{
  constructor(private readonly db: SqliteDatabase) {}

  async findByDatasetId(datasetId: string): Promise<DatasetVersion[]> {
    const rows = this.db
      .prepare(
        `
        SELECT ${datasetVersionColumns}
        FROM dataset_versions
        WHERE dataset_id = ?
        ORDER BY version_number DESC
        `,
      )
      .all(datasetId) as DatasetVersionRow[];

    return rows.map((row) => this.toDomain(row));
  }

  async findById(id: string): Promise<DatasetVersion | null> {
    const row = this.db
      .prepare(
        `
        SELECT ${datasetVersionColumns}
        FROM dataset_versions
        WHERE id = ?
        `,
      )
      .get(id) as DatasetVersionRow | undefined;

    return row ? this.toDomain(row) : null;
  }

  async create(datasetVersion: DatasetVersion): Promise<DatasetVersion> {
    this.db
      .prepare(
        `
        INSERT INTO dataset_versions (
          id,
          workspace_id,
          dataset_id,
          version_number,
          version_name,
          description,
          storage_format,
          storage_uri,
          row_count,
          column_count,
          size_bytes,
          schema_json,
          created_by_operation_id,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
      )
      .run(
        datasetVersion.id,
        datasetVersion.workspaceId,
        datasetVersion.datasetId,
        datasetVersion.versionNumber,
        datasetVersion.versionName ?? null,
        datasetVersion.description ?? null,
        datasetVersion.storageFormat,
        datasetVersion.storageUri,
        datasetVersion.rowCount ?? null,
        datasetVersion.columnCount ?? null,
        datasetVersion.sizeBytes ?? null,
        datasetVersion.schemaJson ?? null,
        datasetVersion.createdByOperationId ?? null,
        datasetVersion.createdAt,
      );

    return datasetVersion;
  }

  private toDomain(row: DatasetVersionRow): DatasetVersion {
    return {
      id: row.id,
      workspaceId: row.workspace_id,
      datasetId: row.dataset_id,
      versionNumber: row.version_number,
      versionName: row.version_name ?? undefined,
      description: row.description ?? undefined,
      storageFormat: row.storage_format as DatasetStorageFormat,
      storageUri: row.storage_uri,
      rowCount: row.row_count ?? undefined,
      columnCount: row.column_count ?? undefined,
      sizeBytes: row.size_bytes ?? undefined,
      schemaJson: row.schema_json ?? undefined,
      createdByOperationId: row.created_by_operation_id ?? undefined,
      createdAt: row.created_at,
    };
  }
}
