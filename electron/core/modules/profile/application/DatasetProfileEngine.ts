import type {
  DatasetProfileInput,
  DatasetProfileResult,
} from "./DatasetProfileDtos";

export interface DatasetProfileEngine {
  profileDataset(input: DatasetProfileInput): Promise<DatasetProfileResult>;
}
