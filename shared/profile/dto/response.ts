import type {
  ColumnProfileReport,
  DataSourceProfileDetail,
  DatasetProfileReport,
  DatasetVersionProfileDetail,
} from "../entities";

export type DatasetProfileReportResponseDto = DatasetProfileReport;

export type DatasetVersionReportResponseDto = DatasetProfileReportResponseDto;

export type ColumnProfileReportResponseDto = ColumnProfileReport;

export type DataSourceProfileDetailResponseDto = DataSourceProfileDetail;

export type DatasetVersionProfileDetailResponseDto = DatasetVersionProfileDetail;

export type GetDatasetVersionProfileReportResponseDto =
  DatasetVersionProfileDetailResponseDto | null;

export type RunDatasetVersionProfileResponseDto =
  DatasetVersionProfileDetailResponseDto;
