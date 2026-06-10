import type { Dataset } from "@shared/types/DataSource";

export interface DatasetRepository {
  findById(id: string): Promise<Dataset | null>;

  findBySourceId(sourceId: string): Promise<Dataset | null>;

  create(dataset: Dataset): Promise<Dataset>;

  update(dataset: Dataset): Promise<Dataset>;
}
