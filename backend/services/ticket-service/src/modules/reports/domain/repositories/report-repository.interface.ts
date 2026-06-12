import type { Report } from "@reports/domain/models/report.entity";

export const REPORT_REPOSITORY = Symbol("REPORT_REPOSITORY");

export interface ReportRepository {
  create(report: Report): Promise<Report>;
  findAll(): Promise<Report[]>;
  findById(id: string): Promise<Report | null>;
  findByCondominiumId(condominiumId: string): Promise<Report[]>;
  findByCondominiumIdAndMonth(
    condominiumId: string,
    month: number,
    year: number,
  ): Promise<Report | null>;
  update(report: Report): Promise<void>;
  delete(id: string): Promise<void>;
}
