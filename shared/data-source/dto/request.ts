export interface ImportCsvRequestDto {
  workspaceId: string;
  filePath: string;
  hasHeader: boolean;
  delimiter?: string;
}

export interface ListDataSourcesRequestDto {
  workspaceId: string;
}

export interface PreviewDataSourceRequestDto {
  workspaceId: string;
  dataSourceId: string;
  rowLimit?: number;
}

export interface DeleteDataSourceRequestDto {
  workspaceId: string;
  dataSourceId: string;
}
