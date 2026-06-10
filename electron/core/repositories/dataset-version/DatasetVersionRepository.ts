import type { DatasetVersion } from "@shared/types/DataSource";

export interface DatasetVersionRepository {
  findByDatasetId(datasetId: string): Promise<DatasetVersion[]>;

  findById(id: string): Promise<DatasetVersion | null>;

  create(datasetVersion: DatasetVersion): Promise<DatasetVersion>;
}
