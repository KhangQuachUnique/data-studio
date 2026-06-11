export interface DatasetVersionColumn {
  id: string;
  datasetVersionId: string;
  columnName: string;
  ordinalPosition: number;
  dataType: string;
  nullable?: boolean;
  originalColumnName?: string;
  createdAt: string;
}
