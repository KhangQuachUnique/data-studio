import type { DataSource } from "@shared/types/DataSource";

export interface DataSourceRepository {
  findByWorkspaceId(workspaceId: string): Promise<DataSource[]>;

  findById(id: string): Promise<DataSource | null>;

  create(dataSource: DataSource): Promise<DataSource>;

  update(dataSource: DataSource): Promise<DataSource>;

  deleteById(id: string): Promise<void>;
}
