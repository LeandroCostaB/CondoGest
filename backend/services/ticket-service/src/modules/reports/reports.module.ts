import { Module } from "@nestjs/common";
import { DashboardStatisticsService } from "@reports/application/services/dashboard-statistics.service";
import { ExcelExportService } from "@reports/application/services/excel-export.service";
import { ExportService } from "@reports/application/services/export.service";
import { PDFExportService } from "@reports/application/services/pdf-export.service";
import { ReportService } from "@reports/application/services/report.service";
import { REPORT_REPOSITORY } from "@reports/domain/repositories/report-repository.interface";
import { ReportController } from "@reports/infra/controllers/report.controller";
import { DrizzleReportRepository } from "@reports/infra/repositories/drizzle-report.repository";

@Module({
  providers: [
    DrizzleReportRepository,
    { provide: REPORT_REPOSITORY, useClass: DrizzleReportRepository },
    ReportService,
    DashboardStatisticsService,
    PDFExportService,
    ExcelExportService,
    ExportService,
  ],
  controllers: [ReportController],
  exports: [ReportService, DashboardStatisticsService, ExportService],
})
export class ReportsModule {}
