import type { Operation } from "@shared/types/DataSource";

export interface OperationRepository {
  create(operation: Operation): Promise<Operation>;

  update(operation: Operation): Promise<Operation>;
}
