import { Injectable } from "@nestjs/common";
import {
  Report,
  ReportStatus,
  ReportType,
} from "@reports/domain/models/report.entity";
import type { ReportRepository } from "@reports/domain/repositories/report-repository.interface";
import { reportSchema } from "@reports/infra/database/schemas/report.schema";
import { DB, getDb } from "@shared/infra/database";
import { and, eq } from "drizzle-orm";

@Injectable()
export class DrizzleReportRepository implements ReportRepository {
  private db: DB;

  constructor() {
    this.db = getDb();
  }

  async create(report: Report): Promise<Report> {
    const [created] = await this.db
      .insert(reportSchema)
      .values({
        condominiumId: report.condominiumId,
        type: report.type,
        status: report.status,
        month: report.month,
        year: report.year,
        startDate: report.startDate,
        endDate: report.endDate,
        data: report.data,
      })
      .returning();

    return Report.restore({
      id: created.id,
      condominiumId: created.condominiumId,
      type: created.type as ReportType,
      status: created.status as ReportStatus,
      month: created.month ?? undefined,
      year: created.year ?? undefined,
      startDate: created.startDate ?? undefined,
      endDate: created.endDate ?? undefined,
      data: created.data as Record<string, unknown> | undefined,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    })!;
  }

  async findAll(): Promise<Report[]> {
    const reports = await this.db.select().from(reportSchema);
    return reports.map(
      (r) =>
        Report.restore({
          id: r.id,
          condominiumId: r.condominiumId,
          type: r.type as ReportType,
          status: r.status as ReportStatus,
          month: r.month ?? undefined,
          year: r.year ?? undefined,
          startDate: r.startDate ?? undefined,
          endDate: r.endDate ?? undefined,
          data: r.data as Record<string, unknown> | undefined,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        })!,
    );
  }

  async findById(id: string): Promise<Report | null> {
    const [report] = await this.db
      .select()
      .from(reportSchema)
      .where(eq(reportSchema.id, id));

    if (!report) return null;

    return Report.restore({
      id: report.id,
      condominiumId: report.condominiumId,
      type: report.type as ReportType,
      status: report.status as ReportStatus,
      month: report.month ?? undefined,
      year: report.year ?? undefined,
      startDate: report.startDate ?? undefined,
      endDate: report.endDate ?? undefined,
      data: report.data as Record<string, unknown> | undefined,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
    })!;
  }

  async findByCondominiumId(condominiumId: string): Promise<Report[]> {
    const reports = await this.db
      .select()
      .from(reportSchema)
      .where(eq(reportSchema.condominiumId, condominiumId));

    return reports.map(
      (r) =>
        Report.restore({
          id: r.id,
          condominiumId: r.condominiumId,
          type: r.type as ReportType,
          status: r.status as ReportStatus,
          month: r.month ?? undefined,
          year: r.year ?? undefined,
          startDate: r.startDate ?? undefined,
          endDate: r.endDate ?? undefined,
          data: r.data as Record<string, unknown> | undefined,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        })!,
    );
  }

  async findByCondominiumIdAndMonth(
    condominiumId: string,
    month: number,
    year: number,
  ): Promise<Report | null> {
    const [report] = await this.db
      .select()
      .from(reportSchema)
      .where(
        and(
          eq(reportSchema.condominiumId, condominiumId),
          eq(reportSchema.month, month),
          eq(reportSchema.year, year),
        ),
      );

    if (!report) return null;

    return Report.restore({
      id: report.id,
      condominiumId: report.condominiumId,
      type: report.type as ReportType,
      status: report.status as ReportStatus,
      month: report.month ?? undefined,
      year: report.year ?? undefined,
      startDate: report.startDate ?? undefined,
      endDate: report.endDate ?? undefined,
      data: report.data as Record<string, unknown> | undefined,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
    })!;
  }

  async update(report: Report): Promise<void> {
    await this.db
      .update(reportSchema)
      .set({
        status: report.status,
        data: report.data,
        updatedAt: new Date(),
      })
      .where(eq(reportSchema.id, report.id!));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(reportSchema).where(eq(reportSchema.id, id));
  }
}
