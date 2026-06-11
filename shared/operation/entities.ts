export type OperationType = "import" | "profile" | "clean" | "export" | "transform";

export type OperationStatus =
  | "pending"
  | "running"
  | "success"
  | "failed"
  | "canceled";

export interface Operation {
  id: string;
  workspaceId: string;
  operationType: OperationType;
  status: OperationStatus;
  sourceId?: string;
  inputVersionId?: string;
  outputVersionId?: string;
  outputProfileReportId?: string;
  engineType?: string;
  name?: string;
  description?: string;
  configJson?: string;
  resultJson?: string;
  errorMessage?: string;
  startedAt?: string;
  finishedAt?: string;
  createdAt: string;
}
