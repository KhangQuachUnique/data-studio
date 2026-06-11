import type { Dataset } from "@shared/dataset/entities";
import type { DatasetVersion } from "@shared/dataset-version/entities";

export type DataSourceType = "file" | "folder" | "database" | "api" | "manual";

export type DataSourceProvider =
  | "local"
  | "postgres"
  | "mysql"
  | "api"
  | "google_sheet";

export interface DataSource {
  id: string;
  workspaceId: string;
  name: string;
  sourceType: DataSourceType;
  sourceUri?: string;
  provider?: DataSourceProvider;
  configJson?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DataSourceListItem {
  dataSource: DataSource;
  dataset?: Dataset;
  currentVersion?: DatasetVersion;
  versionCount: number;
}

export interface DataSourcePreview {
  columns: string[];
  rows: Record<string, unknown>[];
  rowLimit: number;
}
