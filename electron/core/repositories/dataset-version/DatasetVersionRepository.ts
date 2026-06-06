import type { DatasetVersion } from "@shared/types/DataSource";

export interface DatasetVersionRepository {
  findByDataSourceId(dataSourceId: string): Promise<DatasetVersion[]>;

  findById(id: string): Promise<DatasetVersion | null>;

  create(datasetVersion: DatasetVersion): Promise<DatasetVersion>;
}
