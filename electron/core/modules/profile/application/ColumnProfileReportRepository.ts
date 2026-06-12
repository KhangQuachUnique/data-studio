import type { ColumnProfileReport } from "@shared/profile/entities";

export interface ColumnProfileReportRepository {
  createMany(reports: ColumnProfileReport[]): Promise<ColumnProfileReport[]>;

  findByProfileReportId(profileReportId: string): Promise<ColumnProfileReport[]>;
}
