import type { SqliteDatabase } from "@core/db/SqliteConnection";
import type { DatasetVersionColumn } from "@shared/types/DataSource";
import type { DatasetVersionColumnRepository } from "./DatasetVersionColumnRepository";

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
}
