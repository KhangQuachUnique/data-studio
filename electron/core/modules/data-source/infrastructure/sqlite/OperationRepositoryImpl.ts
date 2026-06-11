import type { SqliteDatabase } from "@core/db/SqliteConnection";
import type { Operation } from "@shared/operation/entities";
import type { OperationRepository } from "../../application/OperationRepository";

export class SqliteOperationRepository implements OperationRepository {
  constructor(private readonly db: SqliteDatabase) {}

  async create(operation: Operation): Promise<Operation> {
    this.db
      .prepare(
        `
        INSERT INTO operations (
          id,
          workspace_id,
          operation_type,
          status,
          source_id,
          input_version_id,
          output_version_id,
          output_profile_report_id,
          engine_type,
          name,
          description,
          config_json,
          result_json,
          error_message,
          started_at,
          finished_at,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
      )
      .run(
        operation.id,
        operation.workspaceId,
        operation.operationType,
        operation.status,
        operation.sourceId ?? null,
        operation.inputVersionId ?? null,
        operation.outputVersionId ?? null,
        operation.outputProfileReportId ?? null,
        operation.engineType ?? null,
        operation.name ?? null,
        operation.description ?? null,
        operation.configJson ?? null,
        operation.resultJson ?? null,
        operation.errorMessage ?? null,
        operation.startedAt ?? null,
        operation.finishedAt ?? null,
        operation.createdAt,
      );

    return operation;
  }

  async update(operation: Operation): Promise<Operation> {
    this.db
      .prepare(
        `
        UPDATE operations
        SET
          status = ?,
          source_id = ?,
          input_version_id = ?,
          output_version_id = ?,
          output_profile_report_id = ?,
          engine_type = ?,
          name = ?,
          description = ?,
          config_json = ?,
          result_json = ?,
          error_message = ?,
          started_at = ?,
          finished_at = ?
        WHERE id = ?
        `,
      )
      .run(
        operation.status,
        operation.sourceId ?? null,
        operation.inputVersionId ?? null,
        operation.outputVersionId ?? null,
        operation.outputProfileReportId ?? null,
        operation.engineType ?? null,
        operation.name ?? null,
        operation.description ?? null,
        operation.configJson ?? null,
        operation.resultJson ?? null,
        operation.errorMessage ?? null,
        operation.startedAt ?? null,
        operation.finishedAt ?? null,
        operation.id,
      );

    return operation;
  }
}
