import type {
  DataSource,
  DataSourceListItem,
  DataSourcePreview,
} from "../entities";
import type { Dataset } from "@shared/dataset/entities";
import type { DatasetVersion } from "@shared/dataset-version/entities";

export interface ImportCsvResponseDto {
  dataSource: DataSource;
  dataset: Dataset;
  currentVersion: DatasetVersion;
}

export type ListDataSourcesResponseDto = DataSourceListItem[];

export type PreviewDataSourceResponseDto = DataSourcePreview;

export type DeleteDataSourceResponseDto = void;
