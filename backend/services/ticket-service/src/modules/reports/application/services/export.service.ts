import { Injectable } from "@nestjs/common";
import type { ReportDto } from "@reports/application/dto/report.dto";
import { DashboardStatisticsService } from "./dashboard-statistics.service";
import { ExcelExportService } from "./excel-export.service";
import { PDFExportService } from "./pdf-export.service";

@Injectable()
export class ExportService {
  constructor(
    private readonly pdfExportService: PDFExportService,
    private readonly excelExportService: ExcelExportService,
    private readonly dashboardStatisticsService: DashboardStatisticsService,
  ) {}

  async exportReportToPDF(report: ReportDto): Promise<Buffer> {
    return this.pdfExportService.generateReportPDF(report);
  }

  async exportReportToExcel(report: ReportDto): Promise<Buffer> {
    return this.excelExportService.generateReportExcel(report);
  }

  async exportDashboardStatisticsToPDF(): Promise<Buffer> {
    const statistics = await this.dashboardStatisticsService.getStatistics();
    return this.pdfExportService.generateStatisticsPDF(statistics);
  }

  async exportDashboardStatisticsToExcel(): Promise<Buffer> {
    const statistics = await this.dashboardStatisticsService.getStatistics();
    return this.excelExportService.generateStatisticsExcel(statistics);
  }

  getFileExtension(format: "pdf" | "excel"): string {
    return format === "pdf" ? "pdf" : "xlsx";
  }

  getContentType(format: "pdf" | "excel"): string {
    return format === "pdf"
      ? "application/pdf"
      : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  }

  generateFileName(
    type: string,
    format: "pdf" | "excel",
    identifier?: string,
  ): string {
    const timestamp = new Date().toISOString().split("T")[0];
    const ext = this.getFileExtension(format);

    if (identifier) {
      return `${type}-${identifier}-${timestamp}.${ext}`;
    }
    return `${type}-${timestamp}.${ext}`;
  }
}
