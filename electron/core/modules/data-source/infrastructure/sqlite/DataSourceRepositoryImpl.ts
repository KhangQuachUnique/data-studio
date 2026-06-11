import type { SqliteDatabase } from "@core/db/SqliteConnection";
import type {
  DataSource,
  DataSourceListItem,
  DataSourceProvider,
  DataSourceType,
} from "@shared/data-source/entities";
import type { Dataset, DatasetKind, DatasetStatus } from "@shared/dataset/entities";
import type {
  DatasetStorageFormat,
  DatasetVersion,
} from "@shared/dataset-version/entities";
import type { DataSourceRepository } from "../../application/DataSourceRepository";

interface DataSourceRow {
  id: string;
  workspace_id: string;
  name: string;
  source_type: string;
  source_uri: string | null;
  provider: string | null;
  config_json: string | null;
  created_at: string;
  updated_at: string;
}

interface DataSourceListItemRow extends DataSourceRow {
  dataset_id: string | null;
  dataset_workspace_id: string | null;
  dataset_source_id: string | null;
  dataset_name: string | null;
  dataset_display_name: string | null;
  dataset_description: string | null;
  dataset_kind: string | null;
  dataset_status: string | null;
  dataset_current_version_id: string | null;
  dataset_created_at: string | null;
  dataset_updated_at: string | null;
  current_version_id: string | null;
  current_version_workspace_id: string | null;
  current_version_dataset_id: string | null;
  current_version_number: number | null;
  current_version_name: string | null;
  current_version_description: string | null;
  current_version_storage_format: string | null;
  current_version_storage_uri: string | null;
  current_version_row_count: number | null;
  current_version_column_count: number | null;
  current_version_size_bytes: number | null;
  current_version_schema_json: string | null;
  current_version_created_by_operation_id: string | null;
  current_version_created_at: string | null;
  version_count: number;
}

const dataSourceColumns = `
  id,
  workspace_id,
  name,
  source_type,
  source_uri,
  provider,
  config_json,
  created_at,
  updated_at
`;

export class SqliteDataSourceRepository implements DataSourceRepository {
  constructor(private readonly db: SqliteDatabase) {}

  async findByWorkspaceId(workspaceId: string): Promise<DataSourceListItem[]> {
    const rows = this.db
      .prepare(
        `
        SELECT
          ds.id,
          ds.workspace_id,
          ds.name,
          ds.source_type,
          ds.source_uri,
          ds.provider,
          ds.config_json,
          ds.created_at,
          ds.updated_at,
          dataset.id AS dataset_id,
          dataset.workspace_id AS dataset_workspace_id,
          dataset.source_id AS dataset_source_id,
          dataset.name AS dataset_name,
          dataset.display_name AS dataset_display_name,
          dataset.description AS dataset_description,
          dataset.dataset_kind AS dataset_kind,
          dataset.status AS dataset_status,
          dataset.current_version_id AS dataset_current_version_id,
          dataset.created_at AS dataset_created_at,
          dataset.updated_at AS dataset_updated_at,
          current_version.id AS current_version_id,
          current_version.workspace_id AS current_version_workspace_id,
          current_version.dataset_id AS current_version_dataset_id,
          current_version.version_number AS current_version_number,
          current_version.version_name AS current_version_name,
          current_version.description AS current_version_description,
          current_version.storage_format AS current_version_storage_format,
          current_version.storage_uri AS current_version_storage_uri,
          current_version.row_count AS current_version_row_count,
          current_version.column_count AS current_version_column_count,
          current_version.size_bytes AS current_version_size_bytes,
          current_version.schema_json AS current_version_schema_json,
          current_version.created_by_operation_id AS current_version_created_by_operation_id,
          current_version.created_at AS current_version_created_at,
          (
            SELECT COUNT(*)
            FROM dataset_versions version_count
            WHERE version_count.dataset_id = dataset.id
          ) AS version_count
        FROM data_sources ds
        LEFT JOIN datasets dataset
          ON dataset.source_id = ds.id
          AND dataset.status != 'deleted'
        LEFT JOIN dataset_versions current_version
          ON current_version.id = dataset.current_version_id
        WHERE ds.workspace_id = ?
        ORDER BY ds.updated_at DESC
        `,
      )
      .all(workspaceId) as DataSourceListItemRow[];

    return rows.map((row) => this.toListItemDomain(row));
  }

  async findById(id: string): Promise<DataSource | null> {
    const row = this.db
      .prepare(
        `
        SELECT ${dataSourceColumns}
        FROM data_sources
        WHERE id = ?
        `,
      )
      .get(id) as DataSourceRow | undefined;

    return row ? this.toDomain(row) : null;
  }

  async create(dataSource: DataSource): Promise<DataSource> {
    this.db
      .prepare(
        `
        INSERT INTO data_sources (
          id,
          workspace_id,
          name,
          source_type,
          source_uri,
          provider,
          config_json,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
      )
      .run(
        dataSource.id,
        dataSource.workspaceId,
        dataSource.name,
        dataSource.sourceType,
        dataSource.sourceUri ?? null,
        dataSource.provider ?? null,
        dataSource.configJson ?? null,
        dataSource.createdAt,
        dataSource.updatedAt,
      );

    return dataSource;
  }

  async update(dataSource: DataSource): Promise<DataSource> {
    this.db
      .prepare(
        `
        UPDATE data_sources
        SET
          name = ?,
          source_type = ?,
          source_uri = ?,
          provider = ?,
          config_json = ?,
          updated_at = ?
        WHERE id = ?
        `,
      )
      .run(
        dataSource.name,
        dataSource.sourceType,
        dataSource.sourceUri ?? null,
        dataSource.provider ?? null,
        dataSource.configJson ?? null,
        dataSource.updatedAt,
        dataSource.id,
      );

    return dataSource;
  }

  async deleteById(id: string): Promise<void> {
    this.db
      .prepare(
        `
        DELETE FROM data_sources
        WHERE id = ?
        `,
      )
      .run(id);
  }

  private toDomain(row: DataSourceRow): DataSource {
    return {
      id: row.id,
      workspaceId: row.workspace_id,
      name: row.name,
      sourceType: row.source_type as DataSourceType,
      sourceUri: row.source_uri ?? undefined,
      provider: row.provider ? (row.provider as DataSourceProvider) : undefined,
      configJson: row.config_json ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private toListItemDomain(row: DataSourceListItemRow): DataSourceListItem {
    return {
      currentVersion: this.toDatasetVersionDomain(row),
      dataSource: this.toDomain(row),
      dataset: this.toDatasetDomain(row),
      versionCount: row.version_count,
    };
  }

  private toDatasetDomain(row: DataSourceListItemRow): Dataset | undefined {
    if (!row.dataset_id) {
      return undefined;
    }

    return {
      id: row.dataset_id,
      workspaceId: row.dataset_workspace_id ?? row.workspace_id,
      sourceId: row.dataset_source_id ?? undefined,
      name: row.dataset_name ?? "",
      displayName: row.dataset_display_name ?? undefined,
      description: row.dataset_description ?? undefined,
      datasetKind: row.dataset_kind as DatasetKind,
      status: row.dataset_status as DatasetStatus,
      currentVersionId: row.dataset_current_version_id ?? undefined,
      createdAt: row.dataset_created_at ?? row.created_at,
      updatedAt: row.dataset_updated_at ?? row.updated_at,
    };
  }

  private toDatasetVersionDomain(
    row: DataSourceListItemRow,
  ): DatasetVersion | undefined {
    if (!row.current_version_id || !row.current_version_storage_uri) {
      return undefined;
    }

    return {
      id: row.current_version_id,
      workspaceId: row.current_version_workspace_id ?? row.workspace_id,
      datasetId: row.current_version_dataset_id ?? row.dataset_id ?? "",
      versionNumber: row.current_version_number ?? 0,
      versionName: row.current_version_name ?? undefined,
      description: row.current_version_description ?? undefined,
      storageFormat: row.current_version_storage_format as DatasetStorageFormat,
      storageUri: row.current_version_storage_uri,
      rowCount: row.current_version_row_count ?? undefined,
      columnCount: row.current_version_column_count ?? undefined,
      sizeBytes: row.current_version_size_bytes ?? undefined,
      schemaJson: row.current_version_schema_json ?? undefined,
      createdByOperationId:
        row.current_version_created_by_operation_id ?? undefined,
      createdAt: row.current_version_created_at ?? row.updated_at,
    };
  }
}
