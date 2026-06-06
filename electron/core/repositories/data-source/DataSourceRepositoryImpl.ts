import type { SqliteDatabase } from "@core/db/SqliteConnection";
import type {
  DataSource,
  DataSourceStatus,
  DataSourceType,
  ProfileStatus,
} from "@shared/types/DataSource";
import type { DataSourceRepository } from "./DataSourceRepository";

interface DataSourceRow {
  id: string;
  workspace_id: string;
  name: string;
  type: string;
  original_path: string | null;
  stored_path: string | null;
  table_name: string | null;
  status: string;
  error_message: string | null;
  file_size_bytes: number | null;
  detected_encoding: string | null;
  delimiter: string | null;
  has_header: number;
  row_count: number | null;
  column_count: number | null;
  profile_status: string;
  profiled_at: string | null;
  current_version_id: string | null;
  created_at: string;
  updated_at: string;
}

const dataSourceColumns = `
  id,
  workspace_id,
  name,
  type,
  original_path,
  stored_path,
  table_name,
  status,
  error_message,
  file_size_bytes,
  detected_encoding,
  delimiter,
  has_header,
  row_count,
  column_count,
  profile_status,
  profiled_at,
  current_version_id,
  created_at,
  updated_at
`;

export class SqliteDataSourceRepository implements DataSourceRepository {
  constructor(private readonly db: SqliteDatabase) {}

  async findByWorkspaceId(workspaceId: string): Promise<DataSource[]> {
    const rows = this.db
      .prepare(
        `
        SELECT ${dataSourceColumns}
        FROM data_sources
        WHERE workspace_id = ?
        ORDER BY updated_at DESC
        `,
      )
      .all(workspaceId) as DataSourceRow[];

    return rows.map((row) => this.toDomain(row));
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
          type,
          original_path,
          stored_path,
          table_name,
          status,
          error_message,
          file_size_bytes,
          detected_encoding,
          delimiter,
          has_header,
          row_count,
          column_count,
          profile_status,
          profiled_at,
          current_version_id,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
      )
      .run(
        dataSource.id,
        dataSource.workspaceId,
        dataSource.name,
        dataSource.type,
        dataSource.originalPath ?? null,
        dataSource.storedPath ?? null,
        dataSource.tableName ?? null,
        dataSource.status,
        dataSource.errorMessage ?? null,
        dataSource.fileSizeBytes ?? null,
        dataSource.detectedEncoding ?? null,
        dataSource.delimiter ?? null,
        dataSource.hasHeader ? 1 : 0,
        dataSource.rowCount ?? null,
        dataSource.columnCount ?? null,
        dataSource.profileStatus,
        dataSource.profiledAt ?? null,
        dataSource.currentVersionId ?? null,
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
          type = ?,
          original_path = ?,
          stored_path = ?,
          table_name = ?,
          status = ?,
          error_message = ?,
          file_size_bytes = ?,
          detected_encoding = ?,
          delimiter = ?,
          has_header = ?,
          row_count = ?,
          column_count = ?,
          profile_status = ?,
          profiled_at = ?,
          current_version_id = ?,
          updated_at = ?
        WHERE id = ?
        `,
      )
      .run(
        dataSource.name,
        dataSource.type,
        dataSource.originalPath ?? null,
        dataSource.storedPath ?? null,
        dataSource.tableName ?? null,
        dataSource.status,
        dataSource.errorMessage ?? null,
        dataSource.fileSizeBytes ?? null,
        dataSource.detectedEncoding ?? null,
        dataSource.delimiter ?? null,
        dataSource.hasHeader ? 1 : 0,
        dataSource.rowCount ?? null,
        dataSource.columnCount ?? null,
        dataSource.profileStatus,
        dataSource.profiledAt ?? null,
        dataSource.currentVersionId ?? null,
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
      type: row.type as DataSourceType,
      originalPath: row.original_path ?? undefined,
      storedPath: row.stored_path ?? undefined,
      tableName: row.table_name ?? undefined,
      status: row.status as DataSourceStatus,
      errorMessage: row.error_message ?? undefined,
      fileSizeBytes: row.file_size_bytes ?? undefined,
      detectedEncoding: row.detected_encoding ?? undefined,
      delimiter: row.delimiter ?? undefined,
      hasHeader: row.has_header === 1,
      rowCount: row.row_count ?? undefined,
      columnCount: row.column_count ?? undefined,
      profileStatus: row.profile_status as ProfileStatus,
      profiledAt: row.profiled_at ?? undefined,
      currentVersionId: row.current_version_id ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
