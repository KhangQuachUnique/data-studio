export type DatasetKind = "raw" | "derived" | "cleaned" | "joined" | "aggregated";

export type DatasetStatus = "active" | "archived" | "deleted";

export interface Dataset {
  id: string;
  workspaceId: string;
  sourceId?: string;
  name: string;
  displayName?: string;
  description?: string;
  datasetKind: DatasetKind;
  status: DatasetStatus;
  currentVersionId?: string;
  createdAt: string;
  updatedAt: string;
}
