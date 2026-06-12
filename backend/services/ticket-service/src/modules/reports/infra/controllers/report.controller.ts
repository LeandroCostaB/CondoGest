import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Query,
  Res,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { CreateReportDto } from "@reports/application/dto/create-report.dto";
import { ReportDto } from "@reports/application/dto/report.dto";
import { DashboardStatisticsService } from "@reports/application/services/dashboard-statistics.service";
import { ExportService } from "@reports/application/services/export.service";
import { ReportService } from "@reports/application/services/report.service";
import { Permission } from "@shared/domain/enums/permission.enum";
import { RequirePermissions } from "@shared/infra/decorators/permissions.decorator";
import { HateoasItem, HateoasList } from "@shared/infra/hateoas";
import type { Response } from "express";

@ApiTags("reports")
@ApiBearerAuth()
@Controller("reports")
export class ReportController {
  constructor(
    private readonly reportService: ReportService,
    private readonly dashboardStatisticsService: DashboardStatisticsService,
    private readonly exportService: ExportService,
  ) {}

  @Get("dashboard/statistics")
  @RequirePermissions(Permission.REPORTS_READ)
  @ApiOperation({ summary: "Obter estatísticas do dashboard" })
  async getDashboardStatistics() {
    return this.dashboardStatisticsService.getStatistics();
  }

  @Post("monthly")
  @RequirePermissions(Permission.REPORTS_WRITE)
  @ApiOperation({ summary: "Gerar relatório mensal" })
  @ApiCreatedResponse({ type: ReportDto })
  async createMonthlyReport(@Body() dto: CreateReportDto): Promise<ReportDto> {
    return this.reportService.createMonthlyReport(dto);
  }

  @Post("custom")
  @RequirePermissions(Permission.REPORTS_WRITE)
  @ApiOperation({ summary: "Gerar relatório customizado" })
  @ApiCreatedResponse({ type: ReportDto })
  async createCustomReport(@Body() dto: CreateReportDto): Promise<ReportDto> {
    return this.reportService.createCustomReport(dto);
  }

  @Get()
  @RequirePermissions(Permission.REPORTS_READ)
  @ApiOperation({ summary: "Listar relatórios" })
  @ApiQuery({ name: "_page", required: false, type: Number })
  @ApiQuery({ name: "_size", required: false, type: Number })
  @HateoasList<ReportDto>({
    basePath: "/v1/reports",
    itemLinks: (item) => ({
      self: { href: `/v1/reports/${item.id}`, method: "GET" },
      delete: { href: `/v1/reports/${item.id}`, method: "DELETE" },
    }),
  })
  async findAll(
    @Query("_page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("_size", new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.reportService.listPaginated(page, limit);
  }

  @Get("condominium/:condominiumId")
  @RequirePermissions(Permission.REPORTS_READ)
  @ApiOperation({ summary: "Listar relatórios por condomínio" })
  async findByCondominium(
    @Param("condominiumId", ParseUUIDPipe) condominiumId: string,
  ): Promise<ReportDto[]> {
    return this.reportService.findByCondominiumId(condominiumId);
  }

  @Get(":id")
  @RequirePermissions(Permission.REPORTS_READ)
  @ApiOperation({ summary: "Buscar relatório por ID" })
  @ApiNotFoundResponse({ description: "Relatório não encontrado" })
  @HateoasItem<ReportDto>({
    basePath: "/v1/reports",
    itemLinks: (item) => ({
      self: { href: `/v1/reports/${item.id}`, method: "GET" },
      delete: { href: `/v1/reports/${item.id}`, method: "DELETE" },
      list: { href: "/v1/reports", method: "GET" },
    }),
  })
  async findById(@Param("id", ParseUUIDPipe) id: string): Promise<ReportDto> {
    return this.reportService.findById(id);
  }

  @Post(":id/export")
  @RequirePermissions(Permission.REPORTS_WRITE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Marcar relatório como exportado" })
  async markAsExported(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    return this.reportService.markAsExported(id);
  }

  @Get(":id/export/pdf")
  @RequirePermissions(Permission.REPORTS_READ)
  @ApiOperation({ summary: "Exportar relatório como PDF" })
  async exportReportToPDF(
    @Param("id", ParseUUIDPipe) id: string,
    @Res() res: Response,
  ): Promise<void> {
    const report = await this.reportService.findById(id);
    const pdfBuffer = await this.exportService.exportReportToPDF(report);

    const fileName = this.exportService.generateFileName(
      "relatorio",
      "pdf",
      id,
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    res.send(pdfBuffer);

    await this.reportService.markAsExported(id);
  }

  @Get(":id/export/excel")
  @RequirePermissions(Permission.REPORTS_READ)
  @ApiOperation({ summary: "Exportar relatório como Excel" })
  async exportReportToExcel(
    @Param("id", ParseUUIDPipe) id: string,
    @Res() res: Response,
  ): Promise<void> {
    const report = await this.reportService.findById(id);
    const excelBuffer = await this.exportService.exportReportToExcel(report);

    const fileName = this.exportService.generateFileName(
      "relatorio",
      "excel",
      id,
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Length", excelBuffer.length);
    res.send(excelBuffer);

    await this.reportService.markAsExported(id);
  }

  @Get("dashboard/statistics/export/pdf")
  @RequirePermissions(Permission.REPORTS_READ)
  @ApiOperation({ summary: "Exportar estatísticas do dashboard como PDF" })
  async exportDashboardStatisticsToPDF(@Res() res: Response): Promise<void> {
    const pdfBuffer = await this.exportService.exportDashboardStatisticsToPDF();

    const fileName = this.exportService.generateFileName(
      "dashboard-estatisticas",
      "pdf",
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    res.send(pdfBuffer);
  }

  @Get("dashboard/statistics/export/excel")
  @RequirePermissions(Permission.REPORTS_READ)
  @ApiOperation({ summary: "Exportar estatísticas do dashboard como Excel" })
  async exportDashboardStatisticsToExcel(@Res() res: Response): Promise<void> {
    const excelBuffer =
      await this.exportService.exportDashboardStatisticsToExcel();

    const fileName = this.exportService.generateFileName(
      "dashboard-estatisticas",
      "excel",
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Length", excelBuffer.length);
    res.send(excelBuffer);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.REPORTS_DELETE)
  @ApiOperation({ summary: "Remover relatório" })
  @ApiNoContentResponse({ description: "Relatório removido" })
  @ApiNotFoundResponse({ description: "Relatório não encontrado" })
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    return this.reportService.delete(id);
  }
}
