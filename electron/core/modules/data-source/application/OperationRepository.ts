import type { Operation } from "@shared/operation/entities";

export interface OperationRepository {
  create(operation: Operation): Promise<Operation>;

  update(operation: Operation): Promise<Operation>;
}
