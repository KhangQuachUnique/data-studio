import type { DatasetVersionColumn } from "@shared/dataset-version-column/entities";

export interface DatasetVersionColumnRepository {
  createMany(columns: DatasetVersionColumn[]): Promise<DatasetVersionColumn[]>;

  findByDatasetVersionId(
    datasetVersionId: string,
  ): Promise<DatasetVersionColumn[]>;
}
