import type { SqliteDatabase } from "@core/db/SqliteConnection";
import type { DatasetVersionColumn } from "@shared/dataset-version-column/entities";
import type { DatasetVersionColumnRepository } from "../../application/DatasetVersionColumnRepository";

export class SqliteDatasetVersionColumnRepository
  implements DatasetVersionColumnRepository
{
  constructor(private readonly db: SqliteDatabase) {}

  async createMany(
    columns: DatasetVersionColumn[],
  ): Promise<DatasetVersionColumn[]> {
    const insert = this.db.prepare(
      `
      INSERT INTO dataset_version_columns (
        id,
        dataset_version_id,
        column_name,
        ordinal_position,
        data_type,
        nullable,
        original_column_name,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
    );

    const transaction = this.db.transaction((nextColumns: DatasetVersionColumn[]) => {
      for (const column of nextColumns) {
        insert.run(
          column.id,
          column.datasetVersionId,
          column.columnName,
          column.ordinalPosition,
          column.dataType,
          column.nullable === undefined ? null : column.nullable ? 1 : 0,
          column.originalColumnName ?? null,
          column.createdAt,
        );
      }
    });

    transaction(columns);

    return columns;
  }

  async findByDatasetVersionId(
    datasetVersionId: string,
  ): Promise<DatasetVersionColumn[]> {
    const rows = this.db
      .prepare(
        `
        SELECT
          id,
          dataset_version_id,
          column_name,
          ordinal_position,
          data_type,
          nullable,
          original_column_name,
          created_at
        FROM dataset_version_columns
        WHERE dataset_version_id = ?
        ORDER BY ordinal_position ASC
        `,
      )
      .all(datasetVersionId) as DatasetVersionColumnRow[];

    return rows.map(toDatasetVersionColumn);
  }
}

interface DatasetVersionColumnRow {
  id: string;
  dataset_version_id: string;
  column_name: string;
  ordinal_position: number;
  data_type: string;
  nullable: number | null;
  original_column_name: string | null;
  created_at: string;
}

function toDatasetVersionColumn(
  row: DatasetVersionColumnRow,
): DatasetVersionColumn {
  return {
    id: row.id,
    columnName: row.column_name,
    createdAt: row.created_at,
    dataType: row.data_type,
    datasetVersionId: row.dataset_version_id,
    nullable: row.nullable === null ? undefined : row.nullable === 1,
    ordinalPosition: row.ordinal_position,
    originalColumnName: row.original_column_name ?? undefined,
  };
}
