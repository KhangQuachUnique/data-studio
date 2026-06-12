import type {
  DatasetProfileInput,
  DatasetProfileResult,
} from "./DatasetProfileEngineTypes";

export interface DatasetProfileEngine {
  profileDataset(input: DatasetProfileInput): Promise<DatasetProfileResult>;
}
