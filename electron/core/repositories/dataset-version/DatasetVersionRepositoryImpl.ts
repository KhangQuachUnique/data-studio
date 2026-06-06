import type { SqliteDatabase } from "@core/db/SqliteConnection";
import type {
  DatasetVersion,
  DatasetVersionSourceKind,
  DatasetVersionStatus,
} from "@shared/types/DataSource";
import type { DatasetVersionRepository } from "./DatasetVersionRepository";

interface DatasetVersionRow {
  id: string;
  workspace_id: string;
  data_source_id: string;
  version_number: number;
  source_kind: string;
  parent_version_id: string | null;
  table_name: string;
  row_count: number | null;
  column_count: number | null;
  status: string;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

const datasetVersionColumns = `
  id,
  workspace_id,
  data_source_id,
  version_number,
  source_kind,
  parent_version_id,
  table_name,
  row_count,
  column_count,
  status,
  error_message,
  created_at,
  updated_at
`;

export class SqliteDatasetVersionRepository
  implements DatasetVersionRepository
{
  constructor(private readonly db: SqliteDatabase) {}

  async findByDataSourceId(dataSourceId: string): Promise<DatasetVersion[]> {
    const rows = this.db
      .prepare(
        `
        SELECT ${datasetVersionColumns}
        FROM dataset_versions
        WHERE data_source_id = ?
        ORDER BY version_number DESC
        `,
      )
      .all(dataSourceId) as DatasetVersionRow[];

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
          data_source_id,
          version_number,
          source_kind,
          parent_version_id,
          table_name,
          row_count,
          column_count,
          status,
          error_message,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
      )
      .run(
        datasetVersion.id,
        datasetVersion.workspaceId,
        datasetVersion.dataSourceId,
        datasetVersion.versionNumber,
        datasetVersion.sourceKind,
        datasetVersion.parentVersionId ?? null,
        datasetVersion.tableName,
        datasetVersion.rowCount ?? null,
        datasetVersion.columnCount ?? null,
        datasetVersion.status,
        datasetVersion.errorMessage ?? null,
        datasetVersion.createdAt,
        datasetVersion.updatedAt,
      );

    return datasetVersion;
  }

  private toDomain(row: DatasetVersionRow): DatasetVersion {
    return {
      id: row.id,
      workspaceId: row.workspace_id,
      dataSourceId: row.data_source_id,
      versionNumber: row.version_number,
      sourceKind: row.source_kind as DatasetVersionSourceKind,
      parentVersionId: row.parent_version_id ?? undefined,
      tableName: row.table_name,
      rowCount: row.row_count ?? undefined,
      columnCount: row.column_count ?? undefined,
      status: row.status as DatasetVersionStatus,
      errorMessage: row.error_message ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
