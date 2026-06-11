import type {
  ColumnProfileReport,
  DataSourceProfileDetail,
  DatasetProfileReport,
} from "../entities";

export type DatasetProfileReportResponseDto = DatasetProfileReport;

export type DatasetVersionReportResponseDto = DatasetProfileReportResponseDto;

export type ColumnProfileReportResponseDto = ColumnProfileReport;

export type DataSourceProfileDetailResponseDto = DataSourceProfileDetail;

export type GetDatasetVersionProfileReportResponseDto =
  DatasetVersionReportResponseDto | null;

export type RunDatasetVersionProfileResponseDto = DatasetVersionReportResponseDto;
