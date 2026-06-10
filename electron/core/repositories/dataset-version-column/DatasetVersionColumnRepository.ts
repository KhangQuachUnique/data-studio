import type { DatasetVersionColumn } from "@shared/types/DataSource";

export interface DatasetVersionColumnRepository {
  createMany(columns: DatasetVersionColumn[]): Promise<DatasetVersionColumn[]>;
}
